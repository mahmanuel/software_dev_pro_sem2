from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Issue, Assignment, Notification, AuditLog
from .serializers import (
    IssueSerializer,
    LogoutSerializer,
    UserLoginSerializer,
    UserRegistrationSerializer,
    NotificationSerializer,
    AuditLogSerializer,
)
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import jwt
from django.conf import settings

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"message": "Registration successful! Please verify your email."},
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(APIView):
    def get(self, request):
        token = request.GET.get("token")

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user = get_object_or_404(User, id=payload["user_id"])
            if user.is_verified:
                return Response(
                    {"message": "Your email is already verified!"},
                    status=status.HTTP_200_OK,
                )

            user.is_verified = True
            user.save()

            return Response(
                {"message": "Email verified successfully!"}, status=status.HTTP_200_OK
            )
        except jwt.ExpiredSignatureError:
            return Response(
                {"error": "Verification link expired!"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except jwt.DecodeError:
            return Response(
                {"error": "Invalid token!"}, status=status.HTTP_400_BAD_REQUEST
            )


# User Login API
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]
        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                }
            )
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )


#  User Profile API
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "username": user.username,
            "role": user.role,
            "phone_number": user.phone_number,
            "department": user.department,
            "profile_picture": (
                user.profile_picture.url if user.profile_picture else None
            ),
            "created_at": user.created_at,
            "total_issues": Issue.objects.filter(created_by=user).count(),
            "pending_issues": Issue.objects.filter(
                created_by=user, status="pending"
            ).count(),
            "resolved_issues": Issue.objects.filter(
                created_by=user, status="resolved"
            ).count(),
        }
        return Response(data)


# Logout API (Blacklist Token)
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            token = RefreshToken(serializer.validated_data["refresh"])
            token.blacklist()
            return Response(
                {"message": "Successfully logged out"},
                status=status.HTTP_205_RESET_CONTENT,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ------------------------ ISSUE MANAGEMENT ------------------------
# List and create Issues
class IssueListCreateView(generics.ListCreateAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


# Retrieve, Update, Delete Issues
class IssueDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]


# Assign to Faculty
class AssignIssueView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, issue_id):
        issue = get_object_or_404(Issue, id=issue_id)
        faculty_id = request.data.get("faculty_id")
        faculty = get_object_or_404(User, id=faculty_id, role="Faculty")

        Assignment.objects.create(issue=issue, faculty=faculty)
        return Response(
            {"message": "Issue assigned successfully"}, status=status.HTTP_200_OK
        )


# ------------------------ NOTIFICATIONS & AUDIT LOGS ------------------------
# List Notifications
class NotificationListView(generics.ListAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]


# List Audit Logs
class AuditLogListView(generics.ListAPIView):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]


class SendNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get("message", "New notification")
        user = request.user

        # Save notification in database
        notification = Notification.objects.create(user=user, message=message)

        # Send WebSocket notification
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "notifications", {"type": "send_notification", "message": message}
        )

        return Response({"message": "Notification sent successfully"})
