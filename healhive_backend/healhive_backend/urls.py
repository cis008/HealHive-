from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from reports.views import ReportsView, ReportDetailView


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(_request):
    return Response({'status': 'ok', 'service': 'HealHive API'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health', health_check, name='health-check'),
    path('api/', include('accounts.urls')),
    path('api/reports', ReportsView.as_view(), name='reports'),
    path('api/reports/<int:report_id>', ReportDetailView.as_view(), name='report-detail'),
    path('api/sessions/', include('therapy_sessions.urls')),
    path('video-call/', include('video_calls.urls')),
    path('', include('ai_chatbot.urls')),
]
