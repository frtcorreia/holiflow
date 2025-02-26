import React from "react";
import { LayoutDashboard, Calendar, User, Users, UserCog } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface Props {
  isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: Props) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className={`h-full bg-muted dark:bg-slate-900 shadow-sm dark:shadow-slate-900/50 shadow-md transition-colors text-foreground fixed left-0 top-0 transition-all duration-300 border-r   ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4">
        <h1
          className={`text-xl font-semibold truncate text-foreground ${
            isCollapsed ? "hidden" : "block"
          }`}
        >
          Holi Flow
        </h1>
      </div>

      <nav className="mt-8">
        <Link
          to="/dashboard"
          className={`w-full flex items-center px-6 py-3 text-sm ${
            isActive("/dashboard")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
          }`}
        >
          <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
          <span className={`ml-3 ${isCollapsed ? "hidden" : "block"}`}>
            Dashboard
          </span>
        </Link>

        <Link
          to="/absences"
          className={`w-full flex items-center px-6 py-3 text-sm ${
            isActive("/absences")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
          }`}
        >
          <Calendar className="h-5 w-5 flex-shrink-0" />
          <span className={`ml-3 ${isCollapsed ? "hidden" : "block"}`}>
            Minhas Ausências
          </span>
        </Link>

        <Link
          to="/team"
          className={`w-full flex items-center px-6 py-3 text-sm ${
            isActive("/team")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
          }`}
        >
          <Users className="h-5 w-5 flex-shrink-0" />
          <span className={`ml-3 ${isCollapsed ? "hidden" : "block"}`}>
            A Minha Equipa
          </span>
        </Link>

        {user?.role === "team_leader" && (
          <>
            <Link
              to="/team/manage"
              className={`w-full flex items-center px-6 py-3 text-sm ${
                isActive("/team/manage")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              }`}
            >
              <UserCog className="h-5 w-5 flex-shrink-0" />
              <span className={`ml-3 ${isCollapsed ? "hidden" : "block"}`}>
                Gerir Equipa
              </span>
            </Link>
            <Link
              to="/team/vacations"
              className={`w-full flex items-center px-6 py-3 text-sm ${
                isActive("/team/vacations")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              }`}
            >
              <Calendar className="h-5 w-5 flex-shrink-0" />
              <span className={`ml-3 ${isCollapsed ? "hidden" : "block"}`}>
                Gestão de Férias
              </span>
            </Link>
          </>
        )}

        <Link
          to="/profile"
          className={`w-full flex items-center px-6 py-3 text-sm ${
            isActive("/profile")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
          }`}
        >
          <User className="h-5 w-5 flex-shrink-0" />
          <span className={`ml-3 ${isCollapsed ? "hidden" : "block"}`}>
            Meu Perfil
          </span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
