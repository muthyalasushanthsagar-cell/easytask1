import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationApi } from '../services/api.js';
import { showBrowserNotification } from '../utils/browserNotify.js';

// Polls the backend; new unread notifications also pop up as browser notifications.
export default function useNotifications(intervalMs = 30000) {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const seen = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const list = await notificationApi.list();
      if (seen.current === null) {
        seen.current = new Set(list.map((n) => n.id));
      } else {
        list.forEach((n) => {
          if (!seen.current.has(n.id)) {
            seen.current.add(n.id);
            if (!n.read) showBrowserNotification(n.title, n.message);
          }
        });
      }
      setItems(list);
      setUnread(list.filter((n) => !n.read).length);
    } catch (e) {
      /* backend may be asleep or offline - try again on the next tick */
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  const markRead = useCallback(
    async (id) => {
      try {
        await notificationApi.markRead(id);
      } catch (e) {
        /* ignore */
      }
      refresh();
    },
    [refresh]
  );

  const markAllRead = useCallback(async () => {
    try {
      await notificationApi.markAllRead();
    } catch (e) {
      /* ignore */
    }
    refresh();
  }, [refresh]);

  return { items, unread, refresh, markRead, markAllRead };
}
