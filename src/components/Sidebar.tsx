import React from "react";
import {
  LayoutDashboard,
  Calendar,
  User,
  Users,
  UserCog,
  Activity,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { MenuLink } from "./MenuLink";
import { Role } from "../types";

interface Props {
  isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: Props) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const isAdmin = user?.role === "admin";
  const isTeamLeader = user?.role === "team_leader";

  return (
    <div
      className={`h-full bg-background dark:bg-background shadow-sm dark:shadow-slate-900/50 shadow-md transition-colors text-foreground fixed left-0 top-0 transition-all duration-300 border-r   ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 flex-shrink-0" />
        <h1
          className={`text-xl font-semibold truncate text-foreground ${
            isCollapsed ? "hidden" : "block"
          }`}
        >
          Holi Flow
        </h1>
      </div>

      <nav className="mt-8 flex flex-col gap-2">
        <MenuLink
          isActive={isActive}
          isCollapsed={isCollapsed}
          icon={<LayoutDashboard className="h-5 w-5 flex-shrink-0" />}
          name="Dashboard"
          path="/dashboard"
        />

        <MenuLink
          isActive={isActive}
          isCollapsed={isCollapsed}
          icon={<Calendar className="h-5 w-5 flex-shrink-0" />}
          name="Minhas Ausências"
          path="/absences"
        />

        <MenuLink
          isActive={isActive}
          isCollapsed={isCollapsed}
          icon={<Users className="h-5 w-5 flex-shrink-0" />}
          name="A Minha Equipa"
          path="/team"
        />

        {isTeamLeader && (
          <>
            <MenuLink
              isActive={isActive}
              isCollapsed={isCollapsed}
              icon={<UserCog className="h-5 w-5 flex-shrink-0" />}
              name="Gerir Equipa"
              path="/team/manage"
            />

            <MenuLink
              isActive={isActive}
              isCollapsed={isCollapsed}
              icon={<Calendar className="h-5 w-5 flex-shrink-0" />}
              name="Gestão de Férias"
              path="/team/vacations"
            />
          </>
        )}

        {isAdmin && (
          <MenuLink
            isActive={isActive}
            isCollapsed={isCollapsed}
            icon={<Activity className="h-5 w-5 flex-shrink-0" />}
            name="Logs de Acesso"
            path="/admin/logs"
          />
        )}

        <MenuLink
          isActive={isActive}
          isCollapsed={isCollapsed}
          icon={<User className="h-5 w-5 flex-shrink-0" />}
          name="Meu Perfil"
          path="/profile"
        />
      </nav>
    </div>
  );
};

export default Sidebar;
