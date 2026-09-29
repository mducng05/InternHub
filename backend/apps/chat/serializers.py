from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ("id", "sender", "sender_name", "sender_avatar", "body", "created_at", "read_at")
        read_only_fields = fields

    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.email

    def get_sender_avatar(self, obj):
        if not obj.sender.avatar:
            return None
        request = self.context.get("request")
        url = obj.sender.avatar.url
        return request.build_absolute_uri(url) if request else url


class ConversationSerializer(serializers.ModelSerializer):
    application_id = serializers.IntegerField(source="application.id", read_only=True)
    job_title = serializers.CharField(source="application.job.title", read_only=True)
    company_name = serializers.CharField(source="application.job.employer.company_name", read_only=True)
    company_profile_id = serializers.IntegerField(source="application.job.employer_id", read_only=True)
    candidate_name = serializers.SerializerMethodField()
    candidate_university = serializers.CharField(source="application.student_profile.university", read_only=True)
    candidate_major = serializers.CharField(source="application.student_profile.major", read_only=True)
    other_user_id = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ("id", "application_id", "job_title", "company_name", "company_profile_id", "candidate_name", "candidate_university", "candidate_major", "other_user_id", "last_message", "unread_count", "created_at", "updated_at")

    def _other_user(self, obj):
        user = self.context["request"].user
        if user.role == "student":
            return obj.application.job.employer.user
        return obj.application.student_profile.user

    def get_candidate_name(self, obj):
        user = obj.application.student_profile.user
        return user.get_full_name() or user.email

    def get_other_user_id(self, obj):
        return self._other_user(obj).id

    def get_last_message(self, obj):
        message = obj.messages.order_by("-created_at", "-id").first()
        return MessageSerializer(message, context=self.context).data if message else None

    def get_unread_count(self, obj):
        return obj.messages.filter(read_at__isnull=True).exclude(sender=self.context["request"].user).count()
