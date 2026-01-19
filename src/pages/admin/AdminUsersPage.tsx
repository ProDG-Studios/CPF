import { useState, useMemo } from 'react';
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
  Eye,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { topSuppliers, topMDAs, spvPerformance, usersByRole, formatKES } from '@/data/adminMockData';
import { format, subDays } from 'date-fns';

// Generate comprehensive mock users
const generateMockUsers = () => {
  const users: any[] = [];
  
  // Suppliers
  topSuppliers.forEach((s, i) => {
    users.push({
      id: `sup-${i}`,
      email: s.email,
      full_name: s.name.split(' ')[0] + ' ' + (s.name.split(' ')[1] || 'Manager'),
      role: 'supplier',
      company_name: s.name,
      profile_completed: true,
      created_at: subDays(new Date(), Math.floor(Math.random() * 180) + 30),
      total_value: s.totalValue,
      bills_count: s.billsCount,
    });
  });

  // Add more suppliers
  ['Coastal Engineering', 'Savanna Supplies', 'Highland Medical', 'Valley Transport', 'Metro Construction'].forEach((name, i) => {
    users.push({
      id: `sup-extra-${i}`,
      email: `${name.toLowerCase().replace(' ', '.')}@demo.com`,
      full_name: `Manager ${i + 1}`,
      role: 'supplier',
      company_name: name,
      profile_completed: i % 3 !== 0,
      created_at: subDays(new Date(), Math.floor(Math.random() * 90) + 10),
      total_value: Math.floor(Math.random() * 100_000_000),
      bills_count: Math.floor(Math.random() * 5) + 1,
    });
  });

  // SPVs
  spvPerformance.forEach((s, i) => {
    users.push({
      id: `spv-${i}`,
      email: s.email,
      full_name: s.name.split(' ')[0] + ' Manager',
      role: 'spv',
      spv_name: s.name,
      profile_completed: true,
      created_at: subDays(new Date(), Math.floor(Math.random() * 200) + 60),
      total_value: s.totalValue,
      purchases: s.purchases,
      deeds: s.deeds,
    });
  });

  // MDAs
  topMDAs.forEach((m, i) => {
    users.push({
      id: `mda-${i}`,
      email: `${m.code.toLowerCase()}@demo.com`,
      full_name: `Officer ${i + 1}`,
      role: 'mda',
      mda_name: m.name,
      mda_code: m.code,
      profile_completed: true,
      created_at: subDays(new Date(), Math.floor(Math.random() * 300) + 90),
      total_value: m.totalValue,
      bills_count: m.billsCount,
    });
  });

  // Add more MDA users
  ['John Ochieng', 'Mary Wanjiru', 'Peter Mwangi', 'Grace Nyambura'].forEach((name, i) => {
    users.push({
      id: `mda-extra-${i}`,
      email: `${name.toLowerCase().replace(' ', '.')}@mda.demo.com`,
      full_name: name,
      role: 'mda',
      mda_name: topMDAs[i % topMDAs.length].name,
      mda_code: topMDAs[i % topMDAs.length].code,
      profile_completed: i % 2 === 0,
      created_at: subDays(new Date(), Math.floor(Math.random() * 60) + 10),
    });
  });

  // Treasury
  ['national.treasury@demo.com', 'county.treasury@demo.com', 'cbk.liaison@demo.com'].forEach((email, i) => {
    users.push({
      id: `treasury-${i}`,
      email,
      full_name: ['John Kamau', 'Mary Njeri', 'David Omondi'][i],
      role: 'treasury',
      treasury_office: ['National Treasury', 'County Treasury', 'Central Bank Liaison'][i],
      profile_completed: true,
      created_at: subDays(new Date(), Math.floor(Math.random() * 300) + 120),
    });
  });

  // Admins
  ['admin@demo.com', 'platform.admin@demo.com'].forEach((email, i) => {
    users.push({
      id: `admin-${i}`,
      email,
      full_name: ['System Admin', 'Platform Manager'][i],
      role: 'admin',
      profile_completed: true,
      created_at: subDays(new Date(), 365),
    });
  });

  return users;
};

const mockUsers = generateMockUsers();

const AdminUsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesSearch = 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mda_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.spv_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [searchTerm, roleFilter]);

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
      case 'supplier': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'spv': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'mda': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'treasury': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'admin': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDisplayName = (user: any) => {
    if (user.role === 'supplier') return user.company_name || user.full_name;
    if (user.role === 'spv') return user.spv_name || user.full_name;
    if (user.role === 'mda') return user.mda_name || user.full_name;
    if (user.role === 'treasury') return user.treasury_office || user.full_name;
    return user.full_name;
  };

  const roleCounts = useMemo(() => ({
    all: mockUsers.length,
    supplier: mockUsers.filter(u => u.role === 'supplier').length,
    spv: mockUsers.filter(u => u.role === 'spv').length,
    mda: mockUsers.filter(u => u.role === 'mda').length,
    treasury: mockUsers.filter(u => u.role === 'treasury').length,
    admin: mockUsers.filter(u => u.role === 'admin').length,
  }), []);

  return (
    <div className="min-h-screen">
      <TopBar 
        title="User Management" 
        subtitle={`${mockUsers.length} registered users across all roles`} 
      />
      
      <div className="p-6 space-y-6">
        {/* Role Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { role: 'supplier', label: 'Suppliers', icon: Users, color: 'blue' },
            { role: 'spv', label: 'SPVs', icon: Briefcase, color: 'purple' },
            { role: 'mda', label: 'MDA Users', icon: Building2, color: 'amber' },
            { role: 'treasury', label: 'Treasury', icon: Landmark, color: 'emerald' },
            { role: 'admin', label: 'Admins', icon: Shield, color: 'rose' },
          ].map((item) => (
            <button
              key={item.role}
              onClick={() => setRoleFilter(item.role)}
              className={cn(
                "glass-card p-4 text-left transition-all hover:scale-105",
                roleFilter === item.role && "ring-2 ring-accent"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", `bg-${item.color}-100`)}>
                  <item.icon className={cn("w-5 h-5", `text-${item.color}-600`)} />
                </div>
                <div>
                  <p className={cn("text-2xl font-bold", `text-${item.color}-600`)}>{roleCounts[item.role as keyof typeof roleCounts]}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-wrap items-center justify-between gap-4">
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
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {roleCounts[role.key as keyof typeof roleCounts]}
                  </Badge>
                </button>
              );
            })}
          </div>

          <div className="relative max-w-md w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or organization..."
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                  key={user.id}
                  className="glass-card p-4 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowUserModal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border",
                        getRoleColor(user.role)
                      )}>
                        <RoleIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{getDisplayName(user)}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    {user.profile_completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={cn("text-xs capitalize border", getRoleColor(user.role))}>
                      {user.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>

                  {(user.total_value || user.bills_count || user.purchases) && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                      {user.total_value && (
                        <span className="text-accent font-medium">{formatKES(user.total_value)}</span>
                      )}
                      {user.bills_count && (
                        <span className="text-muted-foreground">{user.bills_count} bills</span>
                      )}
                      {user.purchases && (
                        <span className="text-muted-foreground">{user.purchases} purchases</span>
                      )}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center border-2",
                  getRoleColor(selectedUser.role)
                )}>
                  {(() => {
                    const Icon = getRoleIcon(selectedUser.role);
                    return <Icon className="w-7 h-7" />;
                  })()}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{getDisplayName(selectedUser)}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.full_name}</p>
                  <Badge variant="outline" className={cn("mt-1 capitalize border", getRoleColor(selectedUser.role))}>
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </p>
                  <p className="text-sm font-medium">{selectedUser.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Joined
                  </p>
                  <p className="text-sm font-medium">{format(new Date(selectedUser.created_at), 'MMM d, yyyy')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Profile Status</p>
                  <div className="flex items-center gap-1">
                    {selectedUser.profile_completed ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Complete</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-amber-600 font-medium">Incomplete</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">User ID</p>
                  <p className="text-sm font-mono text-muted-foreground">
                    {selectedUser.id}
                  </p>
                </div>
              </div>

              {selectedUser.total_value && (
                <div className="p-4 bg-accent/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">Activity Summary</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Value</p>
                      <p className="text-lg font-bold text-accent">{formatKES(selectedUser.total_value)}</p>
                    </div>
                    {selectedUser.bills_count && (
                      <div>
                        <p className="text-muted-foreground">Bills</p>
                        <p className="text-lg font-bold">{selectedUser.bills_count}</p>
                      </div>
                    )}
                    {selectedUser.purchases && (
                      <div>
                        <p className="text-muted-foreground">Purchases</p>
                        <p className="text-lg font-bold">{selectedUser.purchases}</p>
                      </div>
                    )}
                    {selectedUser.deeds && (
                      <div>
                        <p className="text-muted-foreground">Deeds</p>
                        <p className="text-lg font-bold">{selectedUser.deeds}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedUser.mda_name && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Ministry</p>
                  <p className="text-sm font-medium">{selectedUser.mda_name}</p>
                  {selectedUser.mda_code && (
                    <Badge variant="secondary" className="text-xs">{selectedUser.mda_code}</Badge>
                  )}
                </div>
              )}

              {selectedUser.spv_name && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">SPV Name</p>
                  <p className="text-sm font-medium">{selectedUser.spv_name}</p>
                </div>
              )}

              {selectedUser.treasury_office && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Treasury Office</p>
                  <p className="text-sm font-medium">{selectedUser.treasury_office}</p>
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
