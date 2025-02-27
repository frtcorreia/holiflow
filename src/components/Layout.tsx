import React, { useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import { NotificationMenu } from "./NotificationsMenu";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "?";
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 transition-colors">
      <Sidebar isCollapsed={isCollapsed} />

      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "pl-16" : "pl-64"
        }`}
      >
        <header className="bg-muted dark:bg-slate-900 shadow-sm dark:shadow-slate-900/50 transition-colors">
          <div className="h-16 px-4 flex items-center justify-between">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-md text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <NotificationMenu />
              <ThemeToggle />
              <div className="flex items-center space-x-2">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: user?.color || "#3B82F6" }}
                >
                  {getInitials()}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-100">
                  {user?.firstName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Terminar Sessão
              </button>
            </div>
          </div>
        </header>

        <main className="py-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
