from rest_framework import serializers
from .models import AssessmentReport


class AssessmentReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentReport
        fields = [
            'id',
            'session_id',
            'user_message',
            'therapist_report',
            'tool_used',
            'score',
            'severity',
            'status',
            'created_at',
        ]


class AssessmentReportCreateSerializer(serializers.Serializer):
    sessionId = serializers.CharField(max_length=128)
    userMessage = serializers.CharField()
    therapistReport = serializers.CharField()
    toolUsed = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    score = serializers.IntegerField(required=False, allow_null=True)
    severity = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def create(self, validated_data):
        return AssessmentReport.objects.create(
            session_id=validated_data['sessionId'],
            user_message=validated_data['userMessage'],
            therapist_report=validated_data['therapistReport'],
            tool_used=validated_data.get('toolUsed'),
            score=validated_data.get('score'),
            severity=validated_data.get('severity'),
        )
