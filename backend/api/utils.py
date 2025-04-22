from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
import jwt
from datetime import datetime, timedelta


def generate_verification_token(user):
    payload = {
        "user_id": user.id,
        "exp": datetime.utcnow() + timedelta(hours=24),  # Token expires in 24 hours
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token


def send_verification_email(user):
    token = generate_verification_token(user)
    verify_url = f"http://127.0.0.1:8000/api/auth/verify-email/?token={token}"

    subject = "Verify Your Email - AITS"
    message = f"Hi {user.username},\n\nPlease click the link below to verify your email:\n{verify_url}\n\nThank you!"

    send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email])
    
