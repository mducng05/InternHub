from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.accounts.models import User
from apps.applications.models import Application
from apps.notifications.models import Notification
from .models import Conversation
from .serializers import ConversationSerializer, MessageSerializer


def participant_filter(user):
    if user.role == User.Role.STUDENT:
        return Q(application__student_profile__user=user)
    if user.role == User.Role.EMPLOYER:
        return Q(application__job__employer__user=user)
    return Q(pk__in=[])


class ConversationListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ConversationSerializer

    def get_queryset(self):
        if self.request.user.role not in (User.Role.STUDENT, User.Role.EMPLOYER):
            return Conversation.objects.none()
        return Conversation.objects.filter(participant_filter(self.request.user)).select_related(
            "application__job__employer__user", "application__student_profile__user"
        )

    def create(self, request, *args, **kwargs):
        if request.user.role not in (User.Role.STUDENT, User.Role.EMPLOYER):
            raise PermissionDenied("Chat chỉ dành cho ứng viên và nhà tuyển dụng.")
        application_id = request.data.get("application_id")
        application = get_object_or_404(
            Application.objects.select_related("job__employer__user", "student_profile__user"),
            pk=application_id,
        )
        is_student = request.user.role == User.Role.STUDENT and application.student_profile.user_id == request.user.id
        is_employer = request.user.role == User.Role.EMPLOYER and application.job.employer.user_id == request.user.id
        if not (is_student or is_employer):
            raise PermissionDenied("Bạn không tham gia đơn ứng tuyển này.")
        conversation, _ = Conversation.objects.get_or_create(application=application)
        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ConversationMessageListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializer
    pagination_class = None

    def get_conversation(self):
        conversation = get_object_or_404(
            Conversation.objects.select_related("application__job__employer__user", "application__student_profile__user"),
            pk=self.kwargs["conversation_id"],
        )
        user = self.request.user
        is_student = user.role == User.Role.STUDENT and conversation.application.student_profile.user_id == user.id
        is_employer = user.role == User.Role.EMPLOYER and conversation.application.job.employer.user_id == user.id
        if not (is_student or is_employer):
            raise PermissionDenied("Bạn không có quyền xem hội thoại này.")
        return conversation

    def get_queryset(self):
        conversation = self.get_conversation()
        conversation.messages.filter(read_at__isnull=True).exclude(sender=self.request.user).update(read_at=timezone.now())
        return conversation.messages.select_related("sender")

    def create(self, request, *args, **kwargs):
        conversation = self.get_conversation()
        body = str(request.data.get("body", "")).strip()
        if not body:
            return Response({"body": "Tin nhắn không được để trống."}, status=status.HTTP_400_BAD_REQUEST)
        if len(body) > 5000:
            return Response({"body": "Tin nhắn tối đa 5000 ký tự."}, status=status.HTTP_400_BAD_REQUEST)
        message = conversation.messages.create(sender=request.user, body=body)
        conversation.save(update_fields=["updated_at"])
        recipient = (
            conversation.application.job.employer.user
            if request.user.role == User.Role.STUDENT
            else conversation.application.student_profile.user
        )
        Notification.objects.create(
            user=recipient,
            type=Notification.Type.SYSTEM,
            title="Bạn có tin nhắn mới",
            content=f"{request.user.get_full_name() or request.user.email} đã nhắn tin về vị trí {conversation.application.job.title}.",
            related_object_type="chat_conversation",
            related_object_id=conversation.pk,
        )
        return Response(self.get_serializer(message).data, status=status.HTTP_201_CREATED)
