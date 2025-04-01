#importing django module
from django.contrib import admin
from django.contrib import admin
from .models import User, Profile, Issue, Assignment, Notification, AuditLog

# Register your models here.
admin.site.register(User)
admin.site.register(Profile)
admin.site.register(Issue)
admin.site.register(Assignment)
admin.site.register(Notification)
admin.site.register(AuditLog)
