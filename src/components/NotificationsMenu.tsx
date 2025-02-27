import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Notification } from "../types";
import { format } from "date-fns";
import { pt } from "date-fns/locale/pt";
import { Check, MoreVertical, Trash2 } from "lucide-react";

export const NotificationMenu = () => {
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

  const totalNotifications =
    notificationsByEmail?.length + notificationsById?.length;
  const totalUnreadNotifications = unreadCountByEmail + unreadCountById;

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {totalUnreadNotifications > 0 && (
            <Badge className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white px-2 py-0.5 text-xs font-medium">
              {totalUnreadNotifications}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-4">
        <DropdownMenuLabel className="mb-2 text-lg font-medium">
          Notificações
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

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
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        onMarkAsRead?.(notification.id);
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Marcar como lida
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        onDelete?.(notification.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
