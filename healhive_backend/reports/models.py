from django.db import models


class AssessmentReport(models.Model):
    STATUS_UNREVIEWED = 'unreviewed'
    STATUS_REVIEWED = 'reviewed'
    STATUS_CHOICES = [
        (STATUS_UNREVIEWED, 'Unreviewed'),
        (STATUS_REVIEWED, 'Reviewed'),
    ]

    session_id = models.CharField(max_length=128)
    user_message = models.TextField()
    therapist_report = models.TextField()
    tool_used = models.CharField(max_length=128, null=True, blank=True)
    score = models.IntegerField(null=True, blank=True)
    severity = models.CharField(max_length=64, null=True, blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_UNREVIEWED)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report {self.id} - session {self.session_id}"
