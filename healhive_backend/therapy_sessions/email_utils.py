from django.conf import settings
from django.core.mail import send_mail


def send_session_email(session):
    therapist_user = session.therapist.user
    patient_user = session.patient.user

    recipients = [patient_user.email, therapist_user.email]
    meeting_link = session.meeting_link
    if meeting_link.startswith('/'):
        app_base_url = getattr(settings, 'APP_BASE_URL', '').rstrip('/')
        if app_base_url:
            meeting_link = f"{app_base_url}{meeting_link}"

    for recipient in recipients:
        is_patient = recipient == patient_user.email
        user_name = patient_user.full_name if is_patient else therapist_user.full_name

        message = (
            f"Hello {user_name},\n\n"
            "Your therapy session has been scheduled.\n\n"
            f"Therapist: {therapist_user.full_name}\n"
            f"Patient: {patient_user.full_name}\n"
            f"Date & Time: {session.session_time}\n\n"
            "Join your secure video session here:\n\n"
            f"{meeting_link}\n\n"
            "Please join a few minutes before your session starts.\n\n"
            "HealHive Team"
        )

        send_mail(
            subject='HealHive Therapy Session Confirmation',
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
            recipient_list=[recipient],
            fail_silently=True,
        )
