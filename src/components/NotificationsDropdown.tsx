import React, { useState, useEffect, useRef } from "react";
import { Bell, MoreVertical, Check, Trash2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import { format } from "date-fns";
import { pt } from "date-fns/locale/pt";
import { Notification } from "../types";

const NotificationsDropdown = () => {
  const { user } = useAuthStore();
  const {
    notificationsByEmail,
    unreadCountByEmail,
    notificationsById,
    unreadCountById,
    markAsRead,
    markAllAsRead,
    subscribeToNotifications,
    deleteNotification,
  } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const totalNotifications =
    notificationsByEmail?.length + notificationsById?.length;
  const totalUnreadNotifications = unreadCountByEmail + unreadCountById;

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToNotifications(user);
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClickMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      console.log("Notificação marcada como lida:", notificationId);
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (user?.id) {
      await markAllAsRead(user.id);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error("Erro ao eliminar notificação:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground rounded-full"
      >
        <Bell className="h-6 w-6" />
        {totalUnreadNotifications > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {totalUnreadNotifications}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-background rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4 border-b border">
            <h3 className="text-lg font-medium text-foreground">
              Notificações
            </h3>
          </div>

          {totalNotifications > 0 ? (
            <>
              <NotificationBlock
                notifications={notificationsByEmail}
                onClick={handleNotificationClickMarkAsRead}
                onDelete={handleDeleteNotification}
                onMarkAsRead={handleNotificationClickMarkAsRead}
              />
              <NotificationBlock
                notifications={notificationsById}
                onClick={handleNotificationClickMarkAsRead}
                onDelete={handleDeleteNotification}
                onMarkAsRead={handleNotificationClickMarkAsRead}
              />
            </>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-2xl mb-2">🔔</p>
              <p>Nenhuma notificação</p>
            </div>
          )}

          {totalUnreadNotifications > 0 && (
            <div className="p-4 border-t border">
              <button
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                onClick={handleMarkAllAsRead}
              >
                Marcar todas como lidas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "vacation_request":
      return "🗓️";
    case "vacation_approved":
      return "✅";
    case "vacation_rejected":
      return "❌";
    case "team_invite":
      return "📧";
    case "team_joined":
      return "👥";
    default:
      return "📢";
  }
};

interface NotificationBlockProps {
  notifications?: Notification[];
  onClick?: (notificationId: string) => void;
  onDelete?: (notificationId: string) => void;
  onMarkAsRead?: (notificationId: string) => void;
}
const NotificationBlock: React.FC<NotificationBlockProps> = ({
  notifications,
  onClick,
  onDelete,
  onMarkAsRead,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="max-h-[32rem] overflow-y-auto">
      <div className="divide-y divide">
        {notifications?.map((notification) => (
          <div
            key={notification?.id}
            className={`p-4 ${
              !notification.read ? "bg-accent/10" : "hover:bg-accent/5"
            }`}
          >
            <div className="flex items-start">
              <div className="flex-1 cursor-pointer">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {notification.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {format(
                        notification.createdAt.toDate(),
                        "d 'de' MMMM 'às' HH:mm",
                        { locale: pt }
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() =>
                    setOpenMenuId(
                      openMenuId === notification.id ? null : notification.id
                    )
                  }
                  className="p-1 rounded-full hover:bg-accent/10"
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>

                {openMenuId === notification.id && (
                  <div className="absolute right-0 mt-1 w-48 bg-background rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-40">
                    <div className="py-1">
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead?.(notification.id);
                            setOpenMenuId(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent/10 z-50"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Marcar como lida
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(notification.id);
                          setOpenMenuId(null);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-accent/10 z-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {!notification.read && (
                <div className="ml-3 flex-shrink-0">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
