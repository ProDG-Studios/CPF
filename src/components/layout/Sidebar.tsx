import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileSearch, 
  Building2, 
  Users, 
  Workflow, 
  TrendingUp, 
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  HelpCircle
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/bills", icon: FileSearch, label: "Bills Explorer" },
  { path: "/workflow", icon: Workflow, label: "Transaction Flow" },
  { path: "/payment-schedule", icon: Calendar, label: "Payment Schedule" },
  { path: "/mdas", icon: Building2, label: "MDAs" },
  { path: "/suppliers", icon: Users, label: "Suppliers" },
  { path: "/analytics", icon: TrendingUp, label: "Analytics" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-sidebar z-40 transition-all duration-200 flex flex-col",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-center border-b border-sidebar-border">
        {collapsed ? (
          <span className="text-lg font-bold text-sidebar-foreground">C</span>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-sidebar-primary flex items-center justify-center">
              <span className="text-xs font-bold text-white">CPF</span>
            </div>
            <span className="text-sm font-semibold text-sidebar-foreground">Securitization</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-150 group relative",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-foreground" 
                  : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-foreground text-background rounded text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <button className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-md w-full text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors duration-150"
        )}>
          <Settings className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </button>
        <button className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-md w-full text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors duration-150"
        )}>
          <HelpCircle className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Help</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
};

export default Sidebar;
