import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Upload,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  Wallet,
  FileCheck,
  Users,
  ClipboardCheck,
  Settings,
  Bell,
  HelpCircle,
  Landmark,
  Briefcase,
  BarChart3,
  Calendar,
  Workflow
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
}

const getNavItems = (role: AppRole): NavItem[] => {
  switch (role) {
    case 'supplier':
      return [
        { path: '/supplier', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/supplier/submit-bill', icon: Upload, label: 'Submit Bill' },
        { path: '/supplier/my-bills', icon: FileText, label: 'My Bills' },
      ];
    case 'spv':
      return [
        { path: '/spv', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/spv/bills', icon: FileText, label: 'Browse Bills' },
        { path: '/spv/offers', icon: Wallet, label: 'My Offers' },
      ];
    case 'mda':
      return [
        { path: '/mda', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/mda/bills', icon: FileText, label: 'Pending Bills' },
        { path: '/mda/approved', icon: FileCheck, label: 'Approved Bills' },
      ];
    case 'treasury':
      return [
        { path: '/treasury', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/treasury/pending', icon: FileText, label: 'Pending Certification' },
        { path: '/treasury/certified', icon: ClipboardCheck, label: 'Certified Bills' },
      ];
    case 'admin':
      return [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/bills', icon: FileText, label: 'All Bills' },
        { path: '/admin/users', icon: Users, label: 'User Management' },
        { path: '/admin/workflow', icon: Workflow, label: 'Workflow Monitor' },
        { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/admin/mdas', icon: Building2, label: 'MDAs Registry' },
      ];
    default:
      return [];
  }
};

const getRoleConfig = (role: AppRole) => {
  switch (role) {
    case 'supplier': return { 
      label: 'Supplier Portal', 
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      color: 'text-blue-500'
    };
    case 'spv': return { 
      label: 'SPV Portal', 
      icon: Briefcase,
      gradient: 'from-purple-500 to-purple-600',
      color: 'text-purple-500'
    };
    case 'mda': return { 
      label: 'MDA Portal', 
      icon: Building2,
      gradient: 'from-orange-500 to-orange-600',
      color: 'text-orange-500'
    };
    case 'treasury': return { 
      label: 'Treasury Portal', 
      icon: Landmark,
      gradient: 'from-emerald-500 to-emerald-600',
      color: 'text-emerald-500'
    };
    case 'admin': return { 
      label: 'Admin Console', 
      icon: Settings,
      gradient: 'from-slate-700 to-slate-800',
      color: 'text-slate-500'
    };
    default: return { 
      label: 'Portal', 
      icon: LayoutDashboard,
      gradient: 'from-gray-500 to-gray-600',
      color: 'text-gray-500'
    };
  }
};

interface PortalLayoutProps {
  children: React.ReactNode;
}

const PortalLayout: React.FC<PortalLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, signOut } = useAuth();

  if (!role) return null;

  const navItems = getNavItems(role);
  const roleConfig = getRoleConfig(role);
  const RoleIcon = roleConfig.icon;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = () => {
    const name = profile?.full_name || user?.email || 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-sidebar text-sidebar-foreground z-40 transition-all duration-300 flex flex-col",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          {collapsed ? (
            <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mx-auto", roleConfig.gradient)}>
              <RoleIcon className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", roleConfig.gradient)}>
                <RoleIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-sidebar-foreground">CPF Settlement</span>
                <span className="text-xs text-sidebar-muted">{roleConfig.label}</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg" 
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 shrink-0 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-card text-card-foreground rounded-lg text-sm font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg border border-border">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          {/* Help */}
          <button className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            collapsed && "justify-center"
          )}>
            <HelpCircle className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm">Help & Support</span>}
          </button>

          {/* User Section */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl w-full hover:bg-sidebar-accent transition-colors",
                collapsed && "justify-center"
              )}>
                <Avatar className="h-9 w-9 border-2 border-sidebar-primary">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {profile?.full_name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-sidebar-muted truncate">{user?.email}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/${role}/profile`)}>
                <User className="w-4 h-4 mr-2" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/${role}/settings`)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-lg hover:bg-secondary transition-colors z-50"
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 min-h-screen",
        collapsed ? "ml-[72px]" : "ml-64"
      )}>
        {children}
      </main>
    </div>
  );
};

export default PortalLayout;
