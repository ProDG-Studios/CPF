import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import DataTable from '@/components/common/DataTable';
import { Supplier, formatCurrency, getStatusColor } from '@/data/mockData';
import { useFilters } from '@/contexts/FilterContext';
import { useData } from '@/contexts/DataContext';
import { 
  Users, 
  CheckCircle, 
  AlertCircle,
  Search,
  ArrowRight,
  Mail,
  MapPin,
  Check,
  Ban,
  Eye
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SuppliersPage = () => {
  const navigate = useNavigate();
  const { toggleArrayFilter } = useFilters();
  const { suppliers, verifySupplier, suspendSupplier, bills } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.registrationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchTerm, statusFilter]);

  const statusData = [
    { name: 'Verified', value: suppliers.filter(s => s.status === 'verified').length, color: 'hsl(142, 76%, 36%)' },
    { name: 'Active', value: suppliers.filter(s => s.status === 'active').length, color: 'hsl(174, 72%, 45%)' },
    { name: 'Suspended', value: suppliers.filter(s => s.status === 'suspended').length, color: 'hsl(0, 72%, 51%)' },
  ];

  const categoryBreakdown = useMemo(() => {
    const categories: Record<string, number> = {};
    suppliers.forEach(s => {
      categories[s.category] = (categories[s.category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, count]) => ({ name, count }));
  }, [suppliers]);

  const handleViewBills = (supplierId: string) => {
    toggleArrayFilter('supplierIds', supplierId);
    navigate('/bills');
  };

  const handleVerifySupplier = (supplier: Supplier) => {
    verifySupplier(supplier.id);
    toast.success(`${supplier.name} has been verified`);
    if (selectedSupplier?.id === supplier.id) {
      setSelectedSupplier({ ...supplier, status: 'verified' });
    }
  };

  const handleSuspendSupplier = (supplier: Supplier) => {
    suspendSupplier(supplier.id);
    toast.warning(`${supplier.name} has been suspended`);
    if (selectedSupplier?.id === supplier.id) {
      setSelectedSupplier({ ...supplier, status: 'suspended' });
    }
  };

  // Calculate supplier bill stats
  const getSupplierBillStats = (supplierId: string) => {
    const supplierBills = bills.filter(b => b.supplierId === supplierId);
    return {
      total: supplierBills.length,
      verified: supplierBills.filter(b => b.status === 'verified').length,
      pending: supplierBills.filter(b => b.status === 'pending').length,
      paid: supplierBills.filter(b => b.status === 'paid').length,
      totalAmount: supplierBills.reduce((sum, b) => sum + b.amount, 0),
    };
  };

  const columns = [
    {
      key: 'name',
      header: 'Supplier',
      sortable: true,
      render: (supplier: Supplier) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <p className="font-medium">{supplier.name}</p>
            <p className="text-xs text-muted-foreground">{supplier.registrationNo}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (supplier: Supplier) => (
        <span className="text-muted-foreground">{supplier.category}</span>
      ),
    },
    {
      key: 'county',
      header: 'Location',
      sortable: true,
      render: (supplier: Supplier) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {supplier.county}
        </div>
      ),
    },
    {
      key: 'totalBills',
      header: 'Bills',
      sortable: true,
      align: 'right' as const,
      render: (supplier: Supplier) => {
        const stats = getSupplierBillStats(supplier.id);
        return (
          <div className="text-right">
            <span className="font-medium">{stats.total || supplier.totalBills}</span>
            {stats.pending > 0 && (
              <span className="text-xs text-warning ml-1">({stats.pending} pending)</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'totalAmount',
      header: 'Total Value',
      sortable: true,
      align: 'right' as const,
      render: (supplier: Supplier) => (
        <span className="font-semibold text-accent">{formatCurrency(supplier.totalAmount, true)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (supplier: Supplier) => {
        const Icon = supplier.status === 'verified' ? CheckCircle : 
                     supplier.status === 'suspended' ? AlertCircle : Users;
        return (
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            getStatusColor(supplier.status)
          )}>
            <Icon className="w-3 h-3" />
            {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      render: (supplier: Supplier) => (
        <div className="flex items-center gap-1">
          {supplier.status === 'active' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleVerifySupplier(supplier);
              }}
              className="p-1.5 hover:bg-success/10 rounded-md transition-colors"
              title="Verify Supplier"
            >
              <Check className="w-4 h-4 text-success" />
            </button>
          )}
          {supplier.status !== 'suspended' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleSuspendSupplier(supplier);
              }}
              className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors"
              title="Suspend Supplier"
            >
              <Ban className="w-4 h-4 text-destructive" />
            </button>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleViewBills(supplier.id);
            }}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 p-1.5"
            title="View Bills"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const totalAmount = filteredSuppliers.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Suppliers" 
        subtitle={`${filteredSuppliers.length} registered suppliers`}
      />
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Status Chart */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold mb-4">By Status</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {statusData.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setStatusFilter(item.name.toLowerCase())}
                    className={cn(
                      "flex items-center justify-between w-full p-2 rounded-lg transition-colors",
                      statusFilter === item.name.toLowerCase() ? "bg-secondary" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold mb-4">By Category</h3>
              <div className="space-y-2">
                {categoryBreakdown.map((cat) => (
                  <div 
                    key={cat.name}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-sm text-muted-foreground">{cat.name}</span>
                    <span className="text-sm font-medium">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Suppliers</p>
                  <p className="text-2xl font-bold">{suppliers.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Outstanding</p>
                  <p className="text-2xl font-bold text-accent">{formatCurrency(totalAmount, true)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verified Rate</p>
                  <p className="text-2xl font-bold text-success">
                    {((statusData[0].value / suppliers.length) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="glass-card overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search suppliers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['all', 'verified', 'active', 'suspended'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize",
                          statusFilter === status 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <DataTable
                data={filteredSuppliers}
                columns={columns}
                keyExtractor={(supplier) => supplier.id}
                onRowClick={(supplier) => setSelectedSupplier(supplier)}
              />

              <div className="p-4 border-t border-border bg-muted/20">
                <p className="text-sm text-muted-foreground text-center">
                  Showing {filteredSuppliers.length} of {suppliers.length} suppliers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Detail Modal */}
      {selectedSupplier && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSupplier(null)}
        >
          <div 
            className="bg-card border border-border rounded-xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Users className="w-7 h-7 text-secondary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold">{selectedSupplier.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedSupplier.registrationNo}</p>
                  </div>
                </div>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                  getStatusColor(selectedSupplier.status)
                )}>
                  {selectedSupplier.status.charAt(0).toUpperCase() + selectedSupplier.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedSupplier.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedSupplier.county}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bills</p>
                  <p className="font-bold text-xl">{selectedSupplier.totalBills}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="font-bold text-xl text-accent">{formatCurrency(selectedSupplier.totalAmount, true)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verified Amount</p>
                  <p className="font-medium text-success">{formatCurrency(selectedSupplier.verifiedAmount, true)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Amount</p>
                  <p className="font-medium text-warning">{formatCurrency(selectedSupplier.pendingAmount, true)}</p>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Contact</p>
                <a 
                  href={`mailto:${selectedSupplier.contactEmail}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {selectedSupplier.contactEmail}
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {selectedSupplier.status === 'active' && (
                  <button
                    onClick={() => handleVerifySupplier(selectedSupplier)}
                    className="flex-1 px-4 py-2 bg-success text-success-foreground rounded-lg font-medium hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Verify Supplier
                  </button>
                )}
                {selectedSupplier.status !== 'suspended' && (
                  <button
                    onClick={() => handleSuspendSupplier(selectedSupplier)}
                    className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg font-medium hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Ban className="w-4 h-4" />
                    Suspend
                  </button>
                )}
                <button
                  onClick={() => handleViewBills(selectedSupplier.id)}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  View Bills <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;
