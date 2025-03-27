from django.shortcuts import render
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .views import CreateUserView
from django.http import JsonResponse
from django.views import View
from .models import (
    User,
    Profile,
    Forum,
    Post,
    ResearchMaterial,
    CollaborationGroup,
    Task,
    Event,
    Mentorship,
    Notification,
    Message,
)
from .serializers import (
    UserSerializer,
    ProfileSerializer,
    ForumSerializer,
    PostSerializer,
    ResearchMaterialSerializer,
    CollaborationGroupSerializer,
    TaskSerializer,
    EventSerializer,
    MentorshipSerializer,
    NotificationSerializer,
    MessageSerializer,
)
 

# User ViewSet
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializers_class = UserSerializer
    permission_classes = [IsAuthenticated]


# Profile Viewset
class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]


# Forum Viewset
class ForumViewSet(viewsets.ModelViewSet):
    queryset = Forum.objects.all()
    serializer_class = ForumSerializer
    permission_classes = [IsAuthenticated]


# Post Viewset
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]


# Research material Viewset
class ResearchMaterialViewSet(viewsets.ModelViewSet):
    queryset = ResearchMaterial.objects.all()
    serializer_class = ResearchMaterialSerializer
    permission_classes = [IsAuthenticated]


# Collaboration Group Viewsets
class CollaborationGroupViewSet(viewsets.ModelViewSet):
    queryset = CollaborationGroup.objects.all()
    serializer_class = CollaborationGroupSerializer
    permission_classes = [IsAuthenticated]


# Task Viewsets
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]


# Event Viewset
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]


# Mentorship Viewsets
class MentorshipViewSet(viewsets.ModelViewSet):
    queryset = Mentorship.objects.all()
    serializer_class = MentorshipSerializer
    permission_classes = [IsAuthenticated]


# Notification ViewSet
class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]


# Message Viewset
class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]


# User Registration View
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def some_view_function():
        from .serializers import UserSerializer  # Import happens only when function is called
        pass  # Add your logic here
    
class CreateUserView(View):
    def post(self,request,*args,**kwargs):
        return JsonResponse({'message':'user created successfully'},status = 201)