import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Building2, 
  Users, 
  GitBranch, 
  BarChart3, 
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard", description: "Overview & KPIs" },
  { path: "/bills", icon: FileText, label: "Bills Explorer", description: "Detailed bills data" },
  { path: "/workflow", icon: GitBranch, label: "Transaction Flow", description: "Settlement process" },
  { path: "/mdas", icon: Building2, label: "MDAs", description: "Ministries & Agencies" },
  { path: "/suppliers", icon: Users, label: "Suppliers", description: "Supplier registry" },
  { path: "/analytics", icon: BarChart3, label: "Analytics", description: "Charts & trends" },
  { path: "/timeline", icon: Calendar, label: "Timeline", description: "Project milestones" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-warning flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-accent-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-display text-lg font-bold text-foreground truncate">
                CPF Platform
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                Securitization System
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary-foreground")} />
              {!collapsed && (
                <div className="overflow-hidden">
                  <span className="font-medium text-sm">{item.label}</span>
                  <p className={cn(
                    "text-xs truncate",
                    isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {item.description}
                  </p>
                </div>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  <span className="font-medium text-sm text-foreground">{item.label}</span>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-border">
        <button className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-lg w-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        )}>
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Settings</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
};

export default Sidebar;
