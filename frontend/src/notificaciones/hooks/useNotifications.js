import { useEffect, useState, useCallback } from "react";
import { getNotifications, markAsRead } from "../services/notificationsApi";
import { useWebSocket } from "./useWebSocket";

export function useNotifications(userId) {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // WebSocket para notificaciones en tiempo real
  const { isConnected, onNotification, onUnreadCountUpdate } =
    useWebSocket(userId);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications({ userId, status: "all", limit: 50 });
      setItems(data.items ?? []);
      setUnread(data.unread ?? 0);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  // Configurar callbacks de WebSocket
  useEffect(() => {
    onNotification((notification) => {
      console.log("Nueva notificación recibida via WebSocket:", notification);
      // Agregar la nueva notificación al inicio de la lista
      setItems((prev) => [notification, ...prev]);
      // Incrementar contador de no leídas
      setUnread((prev) => prev + 1);
    });

    onUnreadCountUpdate((count) => {
      console.log("Contador actualizado via WebSocket:", count);
      setUnread(count);
    });
  }, [onNotification, onUnreadCountUpdate]);

  const markOneRead = async (id) => {
    try {
      await markAsRead({ userId, notifId: id });
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnread((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marcando como leída:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { markAllRead } = await import("../services/notificationsApi");
      await markAllRead(userId);
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
    } catch (error) {
      console.error("Error marcando todas como leídas:", error);
      // Recargar en caso de error
      load();
    }
  };

  return {
    items,
    unread,
    loading,
    error,
    reload: load,
    markOneRead,
    markAllAsRead,
    isWebSocketConnected: isConnected,
  };
}
