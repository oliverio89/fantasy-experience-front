import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationService, {
  AppNotification,
} from "../services/notificationService";
import { useToast } from "../context/ToastContext";

const NotificationCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    try {
      setNotifications(await NotificationService.getLatest());
    } catch (error) {
      console.error("Error loading notifications", error);
    }
  }, [user]);

  useEffect(() => {
    void loadNotifications();
    const refreshInterval = window.setInterval(() => {
      void loadNotifications();
    }, 60_000);

    const refreshOnFocus = () => void loadNotifications();
    window.addEventListener("focus", refreshOnFocus);
    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [loadNotifications]);

  if (!user) return null;

  const unread = notifications.filter((notification) => !notification.readAt)
    .length;

  const openNotification = async (notification: AppNotification) => {
    if (!notification.readAt) {
      try {
        await NotificationService.markAsRead(notification.id);
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, readAt: new Date().toISOString() }
              : item
          )
        );
      } catch {
        showToast("No se pudo actualizar la notificación", "error");
      }
    }
    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  const markAll = async () => {
    try {
      await NotificationService.markAllAsRead();
      const readAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, readAt }))
      );
    } catch {
      showToast("No se pudieron actualizar las notificaciones", "error");
    }
  };

  return (
    <div className="relative z-[100]">
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          void loadNotifications();
        }}
        aria-label="Notificaciones"
        aria-expanded={open}
        className="relative border border-dark-gold rounded-full w-10 h-10 text-dark-gold"
      >
        <span aria-hidden="true">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-2 -right-2 rounded-full bg-red-600 text-white text-xs min-w-5 h-5 px-1 flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <section className="absolute right-0 top-12 w-[min(22rem,85vw)] max-h-96 overflow-y-auto rounded-xl border border-dark-gold bg-black p-4 text-left shadow-xl">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-nude font-bold font-titulo-2">
              Notificaciones
            </h2>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="text-xs text-dark-gold underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-nude">No tienes notificaciones.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => openNotification(notification)}
                    className={`w-full rounded-lg p-3 text-left border ${
                      notification.readAt
                        ? "border-white/10 text-gray-400"
                        : "border-dark-gold text-nude bg-dark-gold/10"
                    }`}
                  >
                    <strong className="block text-sm">
                      {notification.title}
                    </strong>
                    <span className="block text-xs mt-1">
                      {notification.message}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};

export default NotificationCenter;
