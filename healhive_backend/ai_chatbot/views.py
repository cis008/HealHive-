import json
from functools import wraps
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.http import require_GET, require_POST
from accounts.models import User
from .forms import SignupForm, EmailLoginForm
from .models import ChatConversation, ChatMessage, MentalHealthReport
from .services.orchestrator import ChatbotOrchestrator, ensure_test_catalog, get_or_create_conversation, DISCLAIMER
from .services.langchain_service import LangChainMentalHealthService
from .services.crew_agents import CrewAIAssessmentAgents


def redirect_by_role(user):
    if user.role == User.ROLE_THERAPIST:
        return redirect('therapist-dashboard')
    if user.role == User.ROLE_ADMIN:
        return redirect('admin-dashboard')
    return redirect('user-dashboard')


def role_required(*allowed_roles):
    def decorator(view_func):
        @wraps(view_func)
        def wrapped(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('chatbot-login')
            if request.user.role not in allowed_roles:
                return redirect_by_role(request.user)
            return view_func(request, *args, **kwargs)
        return wrapped
    return decorator


def signup_view(request):
    if request.user.is_authenticated:
        return redirect_by_role(request.user)

    form = SignupForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        user = form.save()
        login(request, user)
        return redirect_by_role(user)

    return render(request, 'auth_signup.html', {'form': form})


class EmailLoginView(LoginView):
    template_name = 'auth_login.html'
    authentication_form = EmailLoginForm

    def get_success_url(self):
        if self.request.user.role == User.ROLE_THERAPIST:
            return '/therapist/dashboard/'
        if self.request.user.role == User.ROLE_ADMIN:
            return '/admin-panel/dashboard/'
        return '/user/dashboard/'


@login_required
def logout_view(request):
    logout(request)
    return redirect('chatbot-login')


@login_required
@role_required(User.ROLE_USER)
def chatbot_home(request):
    ensure_test_catalog()
    conversation = ChatConversation.objects.filter(user=request.user).first()
    messages = []
    if conversation:
        messages = list(conversation.messages.values('role', 'content', 'created_at'))

    return render(
        request,
        'chatbot/chatbot.html',
        {
            'disclaimer': DISCLAIMER,
            'conversation': conversation,
            'messages': messages,
        },
    )


@login_required
@role_required(User.ROLE_USER)
def user_dashboard(request):
    reports_count = MentalHealthReport.objects.filter(user=request.user).count()
    return render(request, 'chatbot/user_dashboard.html', {'reports_count': reports_count})


@login_required
@role_required(User.ROLE_THERAPIST)
def therapist_dashboard(request):
    reports = MentalHealthReport.objects.filter(
        user__patient_profile__assigned_therapist__user=request.user
    ).select_related('user', 'test')[:100]
    return render(request, 'chatbot/therapist_dashboard.html', {'reports': reports})


@login_required
@role_required(User.ROLE_ADMIN)
def admin_dashboard(request):
    context = {
        'total_users': User.objects.filter(role=User.ROLE_USER).count(),
        'total_therapists': User.objects.filter(role=User.ROLE_THERAPIST).count(),
        'total_reports': MentalHealthReport.objects.count(),
        'recent_reports': MentalHealthReport.objects.select_related('test').order_by('-created_at')[:10],
    }
    return render(request, 'chatbot/admin_dashboard.html', context)


@login_required
@require_GET
@role_required(User.ROLE_USER)
def reports_view(request):
    reports = MentalHealthReport.objects.filter(user=request.user).select_related('test')[:20]
    return render(request, 'chatbot/reports.html', {'reports': reports})


@login_required
@require_POST
@role_required(User.ROLE_USER)
def chat_message_api(request):
    ensure_test_catalog()

    try:
        payload = json.loads(request.body.decode() or '{}')
    except json.JSONDecodeError:
        payload = {}

    user_message = (payload.get('message') or '').strip()
    conversation_id = payload.get('conversation_id')

    conversation = get_or_create_conversation(request.user, conversation_id)
    if not conversation:
        return JsonResponse({'success': False, 'error': 'Conversation not found.'}, status=404)

    orchestrator = ChatbotOrchestrator()
    result = orchestrator.process(conversation, user_message)

    return JsonResponse(
        {
            'success': True,
            'conversation_id': conversation.id,
            'state': result.get('state'),
            'response': result.get('message'),
            'progress': result.get('progress', {'current': 0, 'total': 0}),
            'report_id': result.get('report_id'),
        }
    )


@login_required
@require_GET
@role_required(User.ROLE_USER)
def conversation_messages_api(request, conversation_id):
    conversation = ChatConversation.objects.filter(id=conversation_id, user=request.user).first()
    if not conversation:
        return JsonResponse({'success': False, 'error': 'Conversation not found'}, status=404)

    messages = list(conversation.messages.values('role', 'content', 'created_at'))
    return JsonResponse({'success': True, 'messages': messages})


@api_view(['POST'])
@permission_classes([AllowAny])
def public_chat_message_api(request):
    payload = request.data if isinstance(request.data, dict) else {}
    user_message = str(payload.get('message') or '').strip()
    session_id = str(payload.get('sessionId') or 'anonymous-session')
    history = payload.get('history') if isinstance(payload.get('history'), list) else []

    if not user_message:
        return Response({'success': False, 'error': 'Message is required.'}, status=400)

    lowered = user_message.lower()
    risk_keywords = ['suicide', 'kill myself', 'self-harm', 'end my life', 'hurt myself']
    flagged = any(keyword in lowered for keyword in risk_keywords)

    langchain = LangChainMentalHealthService()
    crewai = CrewAIAssessmentAgents()

    emotion = langchain.analyze_emotion(user_message)
    test_code = langchain.route_test(emotion.primary_emotion)

    if flagged:
        reply = (
            "I'm really glad you reached out. If you're in immediate danger or might act on these thoughts, "
            "please call your local emergency number right now. You can also contact a crisis line (US/Canada: 988). "
            "If you want, I can stay with you while we find your next safe step."
        )
        therapist_report = (
            f"Session: {session_id}\n"
            f"Risk flag: high\n"
            f"Detected emotion: {emotion.primary_emotion}\n"
            f"User message: {user_message}\n"
            "Recommendation: Immediate crisis safety protocol and urgent human follow-up."
        )
        return Response({
            'success': True,
            'reply': reply,
            'flagged': True,
            'therapistReport': therapist_report,
            'toolUsed': 'crewai+langchain',
            'severity': 'high-risk',
            'score': None,
        })

    crew_output = crewai.run_collaboration(
        user_message=user_message,
        selected_test=test_code,
        score=0,
        severity='screening-pending',
    )

    reply = langchain.generate_supportive_reply(
        message=user_message,
        history=history,
        emotion=emotion.primary_emotion,
    )

    therapist_report = (
        f"Session: {session_id}\n"
        f"Detected emotion: {emotion.primary_emotion} (confidence={emotion.confidence})\n"
        f"Suggested assessment: {test_code}\n"
        f"Observations: {crew_output.get('emotional_observations', '')}\n"
        f"Next steps: {crew_output.get('recommended_next_steps', '')}\n"
        f"Therapy options: {crew_output.get('suggested_therapy_options', '')}"
    )

    return Response({
        'success': True,
        'reply': reply,
        'flagged': False,
        'therapistReport': therapist_report,
        'toolUsed': 'crewai+langchain',
        'severity': emotion.primary_emotion,
        'score': None,
    })
