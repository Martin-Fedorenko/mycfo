import { useEffect, useState, useCallback } from "react";
import { getNotifications, markAsRead } from "../services/notificationsApi";

export function useNotifications(userId) {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const markOneRead = async (id) => {
    await markAsRead({ userId, notifId: id });
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnread((prev) => Math.max(0, prev - 1));
  };

  return { items, unread, loading, error, reload: load, markOneRead };
}
