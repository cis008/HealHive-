from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import User
from .models import TherapySession
from .serializers import BookSessionSerializer, TherapySessionSerializer
from .email_utils import send_session_email


class SessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == User.ROLE_THERAPIST and hasattr(user, 'therapist_profile'):
            sessions = TherapySession.objects.select_related(
                'therapist__user', 'patient__user'
            ).filter(therapist=user.therapist_profile)
        elif user.role == User.ROLE_USER and hasattr(user, 'patient_profile'):
            sessions = TherapySession.objects.select_related(
                'therapist__user', 'patient__user'
            ).filter(patient=user.patient_profile)
        elif user.role == User.ROLE_ADMIN:
            sessions = TherapySession.objects.select_related(
                'therapist__user', 'patient__user'
            ).all()
        else:
            sessions = TherapySession.objects.none()

        return Response({'success': True, 'sessions': TherapySessionSerializer(sessions, many=True).data})


class BookSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != User.ROLE_USER:
            return Response({'success': False, 'error': 'Only patients can book sessions.'}, status=403)

        serializer = BookSessionSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response({'success': False, 'error': serializer.errors}, status=400)

        session = serializer.save()
        base_url = request.build_absolute_uri('/').rstrip('/')
        session.meeting_link = f"{base_url}/video-call/{session.room_id}/"
        session.save(update_fields=['meeting_link'])
        send_session_email(session)

        return Response({'success': True, 'session': TherapySessionSerializer(session).data}, status=201)


class JoinSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        try:
            session = TherapySession.objects.select_related('therapist__user', 'patient__user').get(id=session_id)
        except TherapySession.DoesNotExist:
            return Response({'success': False, 'error': 'Session not found.'}, status=404)

        user_id = request.user.id
        allowed_ids = {session.therapist.user_id, session.patient.user_id}
        if user_id not in allowed_ids and request.user.role != User.ROLE_ADMIN:
            return Response({'success': False, 'error': 'Unauthorized for this session.'}, status=403)

        if not session.meeting_link:
            base_url = request.build_absolute_uri('/').rstrip('/')
            session.meeting_link = f"{base_url}/video-call/{session.room_id}/"
            session.save(update_fields=['meeting_link'])

        return Response({'success': True, 'room_id': session.room_id, 'meeting_link': session.meeting_link})
