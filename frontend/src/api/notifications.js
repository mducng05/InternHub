import client from "./client";

export const fetchNotifications = () => client.get("/notifications/");
export const markNotificationRead = (notificationId) =>
  client.patch(`/notifications/${notificationId}/read/`);
export const markAllNotificationsRead = () => client.post("/notifications/read-all/");
