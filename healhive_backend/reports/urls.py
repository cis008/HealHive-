from django.urls import path
from .views import ReportsView, ReportDetailView

urlpatterns = [
    path('', ReportsView.as_view(), name='reports'),
    path('<int:report_id>', ReportDetailView.as_view(), name='report-detail'),
]
