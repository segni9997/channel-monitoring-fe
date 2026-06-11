import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { LayoutDashboard, AlertCircle, Users, LogOut, List, Palette, ChevronDown, ChevronRight, GitBranchPlusIcon, KeyRound, X, Settings, ScrollText, ShieldCheck } from "lucide-react";
import { Role } from "@/types";

import { useThemeStore, type Theme } from "@/store/themeStore";
import { Sun, Moon, TreeDeciduous, Coffee as CoffeeIcon } from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard, roles: [Role.super_admin, Role.admin, Role.pms_offcier, Role.epayment_officer] },
    { name: "Incidents", path: "/incidents", icon: AlertCircle, roles: [Role.super_admin, Role.admin, Role.pms_offcier, Role.epayment_officer] },
    { name: "Users", path: "/users", icon: Users, roles: [Role.super_admin, Role.admin] },
    { name: "Reasons", path: "/reasons", icon: List, roles: [Role.super_admin, Role.admin] },
    { name: "Branch and ATM", path: "/network", icon: GitBranchPlusIcon, roles: [Role.super_admin, Role.admin] },
    { name: "Settings", path: "/settings", icon: Settings, roles: [Role.super_admin, Role.admin] },
    { name: "Audit Logs", path: "/audit-logs", icon: ScrollText, roles: [Role.super_admin] },
    { name: "Admin Accounts", path: "/admin-accounts", icon: ShieldCheck, roles: [Role.super_admin] },
    { name: "Change Password", path: "/settings/change-password", icon: KeyRound, roles: [Role.super_admin, Role.admin, Role.pms_offcier, Role.epayment_officer] },
  ];

  const allowedLinks = links.filter((l) => user && l.roles.includes(user.role));

  const themes: { name: Theme; icon: any; label: string }[] = [
    { name: "light", icon: Sun, label: "Light" },
    { name: "dark", icon: Moon, label: "Dark" },
    { name: "forest", icon: TreeDeciduous, label: "Berhan Forest" },
    { name: "coffee", icon: CoffeeIcon, label: "Berhan Coffee" },
  ];

  const CurrentThemeIcon = themes.find(t => t.name === theme)?.icon || Palette;

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r bg-card shadow-xl transition-transform duration-300 lg:relative lg:translate-x-0 lg:shadow-sm",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex h-16 items-center justify-between px-6 mt-3 mb-3">
        <span className="text-xl font-extrabold tracking-tight text-accent flex items-center gap-2 flex-col"> 
          <img src="/bg.png" alt="" className="w-full h-10 object-contain" /> 
          <span className="whitespace-nowrap">Channel Monitor</span>
        </span>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 rounded-md hover:bg-muted text-muted-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="flex flex-col gap-1 px-4">
          {allowedLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => onClose?.()}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group",
                  isActive
                    ? "bg-primary/10 text-primary border-l-4 border-accent rounded-l-none"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-accent" : "group-hover:text-accent"
                )} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="border-t p-4 space-y-4">
        <div className="px-2">
          <button
            onClick={() => setIsAppearanceOpen(!isAppearanceOpen)}
            className="flex w-full items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 hover:text-foreground transition-colors group"
          >
            <span className="flex items-center gap-2">
              <Palette className="h-3 w-3" />
              Appearance
            </span>
            {isAppearanceOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
          
          <div className={cn(
            "grid transition-all duration-300 ease-in-out",
            isAppearanceOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 overflow-hidden"
          )}>
            <div className="overflow-hidden">
              <div className="flex items-center justify-between gap-2 mt-2 pt-1 pb-2">
                {themes.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setTheme(t.name)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-md border transition-all",
                      theme === t.name 
                        ? "ring-2 ring-accent ring-offset-2 ring-offset-card border-accent" 
                        : "border-transparent opacity-70 hover:opacity-100 hover:bg-muted"
                    )}
                    title={`${t.label} Theme`}
                  >
                    <t.icon className={cn(
                       "h-4 w-4",
                       theme === t.name ? "text-accent" : "text-muted-foreground"
                    )} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {!isAppearanceOpen && (
             <div className="flex items-center gap-2 px-1 text-[10px] text-muted-foreground">
                <CurrentThemeIcon className="h-3 w-3" />
                <span>Active: {theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
             </div>
          )}
        </div>

        <div className="border-t pt-4 px-2">
          <div className="mb-4">
            <p className="text-sm font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-tight opacity-70">{user?.role?.replace("_", " ")}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
