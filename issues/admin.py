from django.contrib import admin
from .models import Issue, IssueStatus, Comment, Attachment


class IssueStatusInline(admin.TabularInline):
    model = IssueStatus
    extra = 0


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0


class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 0


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "priority",
        "current_status",
        "submitted_by",
        "assigned_to",
        "created_at",
    )
    list_filter = ("category", "priority", "current_status", "created_at")
    search_fields = (
        "title",
        "description",
        "submitted_by__email",
        "assigned_to__email",
    )
    date_hierarchy = "created_at"
    inlines = [IssueStatusInline, CommentInline, AttachmentInline]


@admin.register(IssueStatus)
class IssueStatusAdmin(admin.ModelAdmin):
    list_display = ("issue", "status", "updated_by", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("issue__title", "notes", "updated_by__email")


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("issue", "user", "content", "created_at")
    list_filter = ("created_at",)
    search_fields = ("issue__title", "content", "user__email")


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ("issue", "filename", "uploaded_by", "created_at", "size")
    list_filter = ("created_at",)
    search_fields = ("issue__title", "filename", "uploaded_by__email")
