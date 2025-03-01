import { LayoutDashboard } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

interface MenuLinkProps {
  isActive: (path: string) => boolean;
  isCollapsed: boolean;
  icon: React.ReactNode;
  name: string;
  path: string;
}

export const MenuLink: React.FC<MenuLinkProps> = ({
  isActive,
  isCollapsed,
  icon,
  name,
  path,
}) => {
  return (
    <div className="w-full flex justify-center px-4">
      <Link
        to={path}
        className={`w-full flex items-center ${
          isCollapsed ? "justify-center" : "px-6"
        }  py-3 text-sm rounded-lg ${
          isActive(path)
            ? "bg-primary text-primary-foreground border-primary/50"
            : "text-muted-foreground hover:bg-accent/10 hover:text-foreground border-border/50"
        }`}
      >
        {icon}
        <span className={`ml-3 ${isCollapsed ? "hidden" : "block"}`}>
          {name}
        </span>
      </Link>
    </div>
  );
};
