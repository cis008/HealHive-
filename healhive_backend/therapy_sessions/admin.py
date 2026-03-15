from django.contrib import admin
from .models import TherapySession


@admin.register(TherapySession)
class TherapySessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'therapist', 'patient', 'session_time', 'session_status', 'room_id')
    search_fields = ('room_id', 'therapist__user__full_name', 'patient__user__full_name')
