import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileSearch, 
  Building2, 
  Users, 
  Workflow, 
  TrendingUp, 
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Coins
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/bills", icon: FileSearch, label: "Bills Explorer" },
  { path: "/admin/users", icon: Users, label: "User Management" },
  { path: "/admin/workflow", icon: Workflow, label: "Transaction Flow" },
  { path: "/admin/payment-schedule", icon: Calendar, label: "Payment Schedule" },
  { path: "/admin/mdas", icon: Building2, label: "MDAs" },
  { path: "/admin/analytics", icon: TrendingUp, label: "Analytics" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-[#0a0a0a] border-r border-neutral-800 z-40 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-neutral-800">
        {collapsed ? (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Landmark className="w-5 h-5 text-black" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Landmark className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="text-sm font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">Admin Portal</span>
              <p className="text-[10px] text-neutral-500">Securitisation Origination</p>
            </div>
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/20" 
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              )}
            >
              <item.icon className={cn(
                "w-[18px] h-[18px] shrink-0 transition-colors",
                isActive ? "text-amber-400" : "text-neutral-500 group-hover:text-amber-400/70"
              )} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-neutral-800 text-white rounded-lg text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-neutral-700 shadow-xl">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-neutral-800">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center shadow-lg hover:bg-neutral-700 hover:border-amber-500/30 transition-all duration-200"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-neutral-400" />
        )}
      </button>
    </aside>
  );
};

export default Sidebar;