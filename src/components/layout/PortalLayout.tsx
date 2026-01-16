import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Upload,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  Wallet,
  FileCheck,
  Users,
  ClipboardCheck,
  Settings
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
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/bills', icon: FileText, label: 'All Bills' },
        { path: '/admin/mdas', icon: Building2, label: 'MDAs' },
      ];
    default:
      return [];
  }
};

const getRoleLabel = (role: AppRole): string => {
  switch (role) {
    case 'supplier': return 'Supplier Portal';
    case 'spv': return 'SPV Portal';
    case 'mda': return 'MDA Portal';
    case 'treasury': return 'Treasury Portal';
    case 'admin': return 'Admin Dashboard';
    default: return 'Portal';
  }
};

const getRoleColor = (role: AppRole): string => {
  switch (role) {
    case 'supplier': return 'bg-blue-500';
    case 'spv': return 'bg-purple-500';
    case 'mda': return 'bg-orange-500';
    case 'treasury': return 'bg-green-500';
    case 'admin': return 'bg-accent';
    default: return 'bg-accent';
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-200 flex flex-col",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-border">
          {collapsed ? (
            <div className={cn("w-8 h-8 rounded-md flex items-center justify-center mx-auto", getRoleColor(role))}>
              <span className="text-xs font-bold text-white">
                {role.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-md flex items-center justify-center", getRoleColor(role))}>
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-foreground">{getRoleLabel(role)}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors group relative",
                  isActive 
                    ? "bg-secondary text-foreground font-medium" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && (
                  <span className="text-sm">{item.label}</span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background rounded text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-2 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-3 py-2.5 rounded-md w-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                {!collapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {profile?.full_name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate(`/${role}/profile`)}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/${role}/settings`)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-secondary transition-colors"
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
        "transition-all duration-200",
        collapsed ? "ml-16" : "ml-56"
      )}>
        {children}
      </main>
    </div>
  );
};

export default PortalLayout;
