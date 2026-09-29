import client from "./client";

export const fetchConversations = () => client.get("/chat/conversations/");
export const openConversation = (applicationId) =>
  client.post("/chat/conversations/", { application_id: applicationId });
export const fetchMessages = (conversationId) =>
  client.get(`/chat/conversations/${conversationId}/messages/`);
export const sendMessage = (conversationId, body) =>
  client.post(`/chat/conversations/${conversationId}/messages/`, { body });
