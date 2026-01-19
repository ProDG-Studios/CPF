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
  Workflow,
  Coins
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
        { path: '/supplier/submit-bill', icon: Upload, label: 'Submit Payable' },
        { path: '/supplier/my-bills', icon: FileText, label: 'Receivables' },
      ];
    case 'spv':
      return [
        { path: '/spv', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/spv/bills', icon: FileText, label: 'Browse Payables' },
        { path: '/spv/offers', icon: Wallet, label: 'My Offers' },
        { path: '/spv/blockchain', icon: Workflow, label: 'Blockchain Deeds' },
      ];
    case 'mda':
      return [
        { path: '/mda', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/mda/bills', icon: FileText, label: 'Financial Offers' },
        { path: '/mda/payables', icon: Coins, label: 'Payables Registry' },
        { path: '/mda/approved', icon: FileCheck, label: 'Approved' },
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
      iconColor: 'text-amber-400',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    };
    case 'spv': return { 
      label: 'SPV Portal', 
      icon: Briefcase,
      iconColor: 'text-amber-400',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    };
    case 'mda': return { 
      label: 'MDA Portal', 
      icon: Building2,
      iconColor: 'text-amber-400',
      badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    };
    case 'treasury': return { 
      label: 'Treasury Portal', 
      icon: Landmark,
      iconColor: 'text-amber-400',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };
    case 'admin': return { 
      label: 'Admin Console', 
      icon: Settings,
      iconColor: 'text-amber-400',
      badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    };
    default: return { 
      label: 'Portal', 
      icon: LayoutDashboard,
      iconColor: 'text-amber-400',
      badgeColor: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
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
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Sidebar - Premium Dark with Gold Accents */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-[#0a0a0a] z-40 transition-all duration-300 flex flex-col",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-neutral-800/50">
          {collapsed ? (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Landmark className="w-5 h-5 text-black" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Landmark className="w-5 h-5 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">RSO Platform</span>
                <span className="text-[10px] text-neutral-500">{roleConfig.label}</span>
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
                    ? "bg-gradient-to-r from-amber-500/20 to-amber-600/5 text-amber-400 border border-amber-500/20" 
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 shrink-0 transition-all duration-200",
                  isActive ? "text-amber-400" : "text-neutral-500 group-hover:text-amber-400/70"
                )} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-neutral-800 text-white rounded-lg text-sm font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-neutral-700">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-neutral-800/50 space-y-2">
          {/* Help */}
          <button className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-neutral-500 hover:text-white hover:bg-neutral-800/50 transition-all duration-200",
            collapsed && "justify-center"
          )}>
            <HelpCircle className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm">Help & Support</span>}
          </button>

          {/* User Section */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl w-full hover:bg-neutral-800/50 transition-all duration-200",
                collapsed && "justify-center"
              )}>
                <Avatar className="h-9 w-9 border-2 border-amber-500/30">
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-600 text-black text-xs font-bold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-neutral-200 truncate">
                      {profile?.full_name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-neutral-900 border-neutral-800 text-white">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-white">{profile?.full_name}</p>
                <p className="text-xs text-neutral-400">{user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-neutral-800" />
              <DropdownMenuItem onClick={() => navigate(`/${role}/profile`)} className="text-neutral-300 focus:bg-neutral-800 focus:text-white">
                <User className="w-4 h-4 mr-2" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/${role}/settings`)} className="text-neutral-300 focus:bg-neutral-800 focus:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-800" />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-400 focus:bg-red-500/10 focus:text-red-400">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center shadow-lg hover:bg-neutral-700 hover:border-amber-500/30 transition-all duration-200 z-50"
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-neutral-400" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100",
        collapsed ? "ml-[72px]" : "ml-64"
      )}>
        {children}
      </main>
    </div>
  );
};

export default PortalLayout;