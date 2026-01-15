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
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import CPFLogo from "@/components/CPFLogo";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard", description: "Overview & KPIs" },
  { path: "/bills", icon: FileSearch, label: "Bills Explorer", description: "Detailed bills data" },
  { path: "/workflow", icon: Workflow, label: "Transaction Flow", description: "Settlement process" },
  { path: "/payment-schedule", icon: Calendar, label: "Payment Schedule", description: "MDA repayment plans" },
  { path: "/mdas", icon: Building2, label: "MDAs", description: "Ministries & Agencies" },
  { path: "/suppliers", icon: Users, label: "Suppliers", description: "Supplier registry" },
  { path: "/analytics", icon: TrendingUp, label: "Analytics", description: "Charts & trends" },
  { path: "/timeline", icon: Sparkles, label: "Timeline", description: "Project milestones" },
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
      <div className="p-4 border-b border-border/50">
        <CPFLogo collapsed={collapsed} />
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
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200 group relative",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg",
                isActive 
                  ? "bg-primary-foreground/20" 
                  : ""
              )}>
                <item.icon className={cn(
                  "w-5 h-5 shrink-0 transition-transform",
                  isActive && "text-primary-foreground",
                  "group-hover:scale-110"
                )} />
              </div>
              {!collapsed && (
                <div className="overflow-hidden flex-1 min-w-0">
                  <span className="font-semibold text-sm block truncate">{item.label}</span>
                  <p className={cn(
                    "text-xs truncate mt-0.5",
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {item.description}
                  </p>
                </div>
              )}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-popover border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 backdrop-blur-sm">
                  <span className="font-semibold text-sm text-foreground block">{item.label}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-border/50">
        <button className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-lg w-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200"
        )}>
          <div className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <Settings className="w-5 h-5 shrink-0 transition-transform hover:rotate-90" />
          </div>
          {!collapsed && <span className="font-semibold text-sm">Settings</span>}
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
