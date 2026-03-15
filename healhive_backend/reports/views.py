from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import User
from .models import AssessmentReport
from .serializers import AssessmentReportSerializer, AssessmentReportCreateSerializer


class ReportsView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsAuthenticated()]

    def post(self, request):
        serializer = AssessmentReportCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'error': serializer.errors}, status=400)

        report = serializer.save()
        return Response({'success': True, 'reportId': report.id}, status=201)

    def get(self, request):
        if request.user.role not in [User.ROLE_THERAPIST, User.ROLE_ADMIN]:
            return Response({'success': False, 'error': 'Access restricted to therapists and admins.'}, status=403)

        reports = AssessmentReport.objects.all()[:100]
        return Response({'success': True, 'reports': AssessmentReportSerializer(reports, many=True).data})


class ReportDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, report_id):
        if request.user.role not in [User.ROLE_THERAPIST, User.ROLE_ADMIN]:
            return Response({'success': False, 'error': 'Access restricted to therapists and admins.'}, status=403)

        try:
            report = AssessmentReport.objects.get(id=report_id)
        except AssessmentReport.DoesNotExist:
            return Response({'success': False, 'error': 'Report not found.'}, status=404)

        return Response({'success': True, 'report': AssessmentReportSerializer(report).data})
