from django.urls import path

from .views import ConversationListCreateView, ConversationMessageListCreateView

app_name = "chat"

urlpatterns = [
    path("conversations/", ConversationListCreateView.as_view(), name="conversation-list-create"),
    path("conversations/<int:conversation_id>/messages/", ConversationMessageListCreateView.as_view(), name="conversation-messages"),
]
