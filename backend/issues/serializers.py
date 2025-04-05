from rest_framework import serializers
from .models import Issue, IssueStatus, Comment, Attachment
from users.serializers import UserSerializer


class CommentSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source="user", read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "issue",
            "user",
            "content",
            "created_at",
            "updated_at",
            "user_details",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at", "user_details"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class IssueStatusSerializer(serializers.ModelSerializer):
    updated_by_details = UserSerializer(source="updated_by", read_only=True)

    class Meta:
        model = IssueStatus
        fields = [
            "id",
            "issue",
            "status",
            "notes",
            "updated_by",
            "created_at",
            "updated_by_details",
        ]
        read_only_fields = ["id", "updated_by", "created_at", "updated_by_details"]

    def create(self, validated_data):
        validated_data["updated_by"] = self.context["request"].user
        return super().create(validated_data)


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = [
            "id",
            "issue",
            "file",
            "filename",
            "uploaded_by",
            "created_at",
            "size",
        ]
        read_only_fields = ["id", "uploaded_by", "created_at", "filename", "size"]

    def create(self, validated_data):
        validated_data["uploaded_by"] = self.context["request"].user
        validated_data["filename"] = validated_data["file"].name
        validated_data["size"] = validated_data["file"].size
        return super().create(validated_data)


class IssueSerializer(serializers.ModelSerializer):
    submitted_by_details = UserSerializer(source="submitted_by", read_only=True)
    assigned_to_details = UserSerializer(source="assigned_to", read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    statuses = IssueStatusSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Issue
        fields = [
            "id",
            "title",
            "description",
            "category",
            "priority",
            "submitted_by",
            "assigned_to",
            "current_status",
            "created_at",
            "updated_at",
            "external_reference",
            "submitted_by_details",
            "assigned_to_details",
            "comments",
            "statuses",
            "attachments",
        ]
        read_only_fields = [
            "id",
            "submitted_by",
            "created_at",
            "updated_at",
            "external_reference",
        ]

    def create(self, validated_data):
        validated_data["submitted_by"] = self.context["request"].user
        return super().create(validated_data)


class IssueListSerializer(serializers.ModelSerializer):
    submitted_by_details = UserSerializer(source="submitted_by", read_only=True)
    assigned_to_details = UserSerializer(source="assigned_to", read_only=True)

    class Meta:
        model = Issue
        fields = [
            "id",
            "title",
            "description",
            "category",
            "priority",
            "current_status",
            "created_at",
            "updated_at",
            "submitted_by_details",
            "assigned_to_details",
        ]
