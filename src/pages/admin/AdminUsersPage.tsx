import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import TopBar from '@/components/layout/TopBar';
import PartyIdentityCard from '@/components/identity/PartyIdentityCard';
import { 
  Users, 
  Search, 
  Building2,
  Briefcase,
  Landmark,
  Shield,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UserWithRole {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  company_name?: string;
  mda_name?: string;
  spv_name?: string;
  profile_completed?: boolean;
  created_at: string;
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles = profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          user_id: profile.user_id,
          email: profile.email,
          full_name: profile.full_name || 'Not set',
          role: userRole?.role || 'unknown',
          company_name: profile.company_name,
          mda_name: profile.mda_name,
          spv_name: profile.spv_name,
          profile_completed: profile.profile_completed,
          created_at: profile.created_at,
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mda_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.spv_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'supplier': return Users;
      case 'spv': return Briefcase;
      case 'mda': return Building2;
      case 'treasury': return Landmark;
      case 'admin': return Shield;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'supplier': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'spv': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'mda': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'treasury': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'admin': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDisplayName = (user: UserWithRole) => {
    if (user.role === 'supplier') return user.company_name || user.full_name;
    if (user.role === 'spv') return user.spv_name || user.full_name;
    if (user.role === 'mda') return user.mda_name || user.full_name;
    return user.full_name;
  };

  const roleCounts = useMemo(() => ({
    all: users.length,
    supplier: users.filter(u => u.role === 'supplier').length,
    spv: users.filter(u => u.role === 'spv').length,
    mda: users.filter(u => u.role === 'mda').length,
    treasury: users.filter(u => u.role === 'treasury').length,
    admin: users.filter(u => u.role === 'admin').length,
  }), [users]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBar 
        title="User Management" 
        subtitle={`${users.length} registered users`} 
      />
      
      <div className="p-6 space-y-6">
        {/* Role Filter Tabs */}
        <div className="glass-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'all', label: 'All Users', icon: Users },
              { key: 'supplier', label: 'Suppliers', icon: Users },
              { key: 'spv', label: 'SPVs', icon: Briefcase },
              { key: 'mda', label: 'MDAs', icon: Building2 },
              { key: 'treasury', label: 'Treasury', icon: Landmark },
              { key: 'admin', label: 'Admins', icon: Shield },
            ].map(role => {
              const Icon = role.icon;
              return (
                <button
                  key={role.key}
                  onClick={() => setRoleFilter(role.key)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    roleFilter === role.key
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {role.label}
                  <span className="ml-1 px-1.5 py-0.5 bg-background/50 rounded text-xs">
                    {roleCounts[role.key as keyof typeof roleCounts]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or organization..."
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full glass-card p-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm">Try adjusting your search or filter</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              return (
                <div
                  key={user.user_id}
                  className="glass-card p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowUserModal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        getRoleColor(user.role)
                      )}>
                        <RoleIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{getDisplayName(user)}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    {user.profile_completed ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium capitalize",
                      getRoleColor(user.role)
                    )}>
                      {user.role}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <PartyIdentityCard
                party={{
                  role: selectedUser.role as 'supplier' | 'spv' | 'mda' | 'treasury',
                  name: selectedUser.full_name,
                  company: selectedUser.company_name,
                  mdaName: selectedUser.mda_name,
                  spvName: selectedUser.spv_name,
                  email: selectedUser.email,
                  isVerified: selectedUser.profile_completed,
                }}
                variant="detailed"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Role</p>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium capitalize",
                    getRoleColor(selectedUser.role)
                  )}>
                    {selectedUser.role}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Profile Status</p>
                  <div className="flex items-center gap-1">
                    {selectedUser.profile_completed ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-sm text-success">Complete</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Incomplete</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">User ID</p>
                  <p className="text-sm font-mono text-muted-foreground truncate">
                    {selectedUser.user_id.slice(0, 8)}...
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Joined</p>
                  <p className="text-sm">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedUser.role === 'supplier' && selectedUser.company_name && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Company</p>
                  <p className="text-sm font-medium">{selectedUser.company_name}</p>
                </div>
              )}

              {selectedUser.role === 'spv' && selectedUser.spv_name && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">SPV Name</p>
                  <p className="text-sm font-medium">{selectedUser.spv_name}</p>
                </div>
              )}

              {selectedUser.role === 'mda' && selectedUser.mda_name && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">MDA</p>
                  <p className="text-sm font-medium">{selectedUser.mda_name}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersPage;
