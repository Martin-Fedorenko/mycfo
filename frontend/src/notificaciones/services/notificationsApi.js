import api from "../listado-notificaciones/components/Api.js";

export async function getNotifications({
  userId,
  status = "all",
  limit = 50,
  page = 0,
}) {
  const { data } = await api.get(`/users/${userId}/notifications`, {
    params: { status, size: limit, page },
  });
  return data; // { unread, items: [...] }
}

export async function getUnreadCount(userId) {
  const { data } = await api.get(`/users/${userId}/notifications/unreadCount`);
  return data.unread;
}

export async function markAsRead({ userId, notifId }) {
  await api.patch(`/users/${userId}/notifications/${notifId}`, {
    is_read: true,
  });
}

export async function markAllRead(userId) {
  await api.post(`/users/${userId}/notifications:markAllRead`);
}
