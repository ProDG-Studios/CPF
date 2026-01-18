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
  Eye,
  Download,
  Printer,
  FileText,
  TrendingUp
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generateCSV, generatePrintableReport } from '@/lib/exportUtils';
import { DocumentModal } from '@/components/common/DocumentUpload';
import { Progress } from '@/components/ui/progress';

const SuppliersPage = () => {
  const navigate = useNavigate();
  const { toggleArrayFilter } = useFilters();
  const { suppliers, verifySupplier, suspendSupplier, bills } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [docSupplierId, setDocSupplierId] = useState<string>('');

  // Calculate live supplier stats from bills
  const getSupplierBillStats = (supplierId: string) => {
    const supplierBills = bills.filter(b => b.supplierId === supplierId);
    return {
      totalBills: supplierBills.length,
      verifiedBills: supplierBills.filter(b => b.status === 'verified').length,
      pendingBills: supplierBills.filter(b => b.status === 'pending').length,
      paidBills: supplierBills.filter(b => b.status === 'paid').length,
      processingBills: supplierBills.filter(b => b.status === 'processing').length,
      totalAmount: supplierBills.reduce((sum, b) => sum + b.amount, 0),
      verifiedAmount: supplierBills.filter(b => b.status === 'verified').reduce((sum, b) => sum + b.amount, 0),
      pendingAmount: supplierBills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0),
      paidAmount: supplierBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0),
    };
  };

  // Enrich suppliers with live stats
  const enrichedSuppliers = useMemo(() => {
    return suppliers.map(supplier => ({
      ...supplier,
      ...getSupplierBillStats(supplier.id),
    }));
  }, [suppliers, bills]);

  const filteredSuppliers = useMemo(() => {
    return enrichedSuppliers.filter(supplier => {
      const matchesSearch = 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.registrationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedSuppliers, searchTerm, statusFilter]);

  const statusData = useMemo(() => [
    { name: 'Verified', value: suppliers.filter(s => s.status === 'verified').length, color: 'hsl(142, 76%, 36%)' },
    { name: 'Active', value: suppliers.filter(s => s.status === 'active').length, color: 'hsl(174, 72%, 45%)' },
    { name: 'Suspended', value: suppliers.filter(s => s.status === 'suspended').length, color: 'hsl(0, 72%, 51%)' },
  ], [suppliers]);

  const categoryBreakdown = useMemo(() => {
    const categories: Record<string, number> = {};
    suppliers.forEach(s => {
      categories[s.category] = (categories[s.category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
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

  const handleUploadDocs = (supplierId: string) => {
    setDocSupplierId(supplierId);
    setShowDocModal(true);
  };

  const handleExportCSV = () => {
    generateCSV(
      filteredSuppliers.map(s => ({
        'Supplier Name': s.name,
        'Registration No': s.registrationNo,
        'Category': s.category,
        'Location': s.county,
        'Status': s.status,
        'Total Bills': s.totalBills,
        'Total Amount': s.totalAmount,
        'Verified Amount': s.verifiedAmount,
        'Pending Amount': s.pendingAmount,
        'Paid Amount': s.paidAmount,
        'Contact Email': s.contactEmail,
      })),
      'suppliers_export'
    );
    toast.success('Suppliers exported to CSV');
  };

  const handlePrintReport = () => {
    const totalAmount = filteredSuppliers.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalVerified = filteredSuppliers.reduce((sum, s) => sum + s.verifiedAmount, 0);
    const totalPaid = filteredSuppliers.reduce((sum, s) => sum + s.paidAmount, 0);
    
    const content = `
      <div style="margin-bottom: 24px;">
        <h2 style="margin-bottom: 16px; color: #333;">Summary Statistics</h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
          <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
            <p style="font-size: 24px; font-weight: bold; margin: 0;">${filteredSuppliers.length}</p>
            <p style="color: #666; margin: 4px 0 0;">Total Suppliers</p>
          </div>
          <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
            <p style="font-size: 24px; font-weight: bold; margin: 0;">${formatCurrency(totalAmount, true)}</p>
            <p style="color: #666; margin: 4px 0 0;">Total Value</p>
          </div>
          <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
            <p style="font-size: 24px; font-weight: bold; color: #22c55e; margin: 0;">${formatCurrency(totalVerified, true)}</p>
            <p style="color: #666; margin: 4px 0 0;">Verified</p>
          </div>
          <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
            <p style="font-size: 24px; font-weight: bold; color: #3b82f6; margin: 0;">${formatCurrency(totalPaid, true)}</p>
            <p style="color: #666; margin: 4px 0 0;">Paid</p>
          </div>
        </div>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Supplier</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Category</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Location</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Status</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Bills</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total Value</th>
          </tr>
        </thead>
        <tbody>
          ${filteredSuppliers.slice(0, 30).map(s => `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                <strong>${s.name}</strong><br/>
                <span style="font-size: 12px; color: #666;">${s.registrationNo}</span>
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${s.category}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${s.county}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-transform: capitalize;">${s.status}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${s.totalBills}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(s.totalAmount, true)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${filteredSuppliers.length > 30 ? `<p style="margin-top: 16px; color: #666;">Showing 30 of ${filteredSuppliers.length} suppliers</p>` : ''}
    `;
    generatePrintableReport('Suppliers Summary Report', content);
  };

  // Get selected supplier with live stats
  const selectedSupplierStats = selectedSupplier ? getSupplierBillStats(selectedSupplier.id) : null;

  const columns = [
    {
      key: 'name',
      header: 'Supplier',
      sortable: true,
      render: (supplier: Supplier & ReturnType<typeof getSupplierBillStats>) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <Users className="w-5 h-5 text-muted-foreground" />
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
      render: (supplier: Supplier & ReturnType<typeof getSupplierBillStats>) => (
        <span className="text-muted-foreground">{supplier.category}</span>
      ),
    },
    {
      key: 'county',
      header: 'Location',
      sortable: true,
      render: (supplier: Supplier & ReturnType<typeof getSupplierBillStats>) => (
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
      render: (supplier: Supplier & ReturnType<typeof getSupplierBillStats>) => (
        <div className="text-right">
          <span className="font-medium">{supplier.totalBills}</span>
          {supplier.pendingBills > 0 && (
            <span className="text-xs text-warning ml-1">({supplier.pendingBills} pending)</span>
          )}
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Value',
      sortable: true,
      align: 'right' as const,
      render: (supplier: Supplier & ReturnType<typeof getSupplierBillStats>) => (
        <span className="font-semibold">{formatCurrency(supplier.totalAmount, true)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (supplier: Supplier & ReturnType<typeof getSupplierBillStats>) => {
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
      render: (supplier: Supplier & ReturnType<typeof getSupplierBillStats>) => (
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
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground p-1.5"
            title="View Bills"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const totalAmount = filteredSuppliers.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalVerified = filteredSuppliers.reduce((sum, s) => sum + s.verifiedAmount, 0);
  const totalPaid = filteredSuppliers.reduce((sum, s) => sum + s.paidAmount, 0);
  const verificationRate = suppliers.length > 0 ? ((statusData[0].value / suppliers.length) * 100).toFixed(0) : '0';

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
            <div className="glass-card p-5">
              <h3 className="font-semibold text-foreground mb-4">By Status</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(220, 15%, 88%)', borderRadius: '6px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3">
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
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-foreground mb-4">By Category</h3>
              <div className="space-y-2">
                {categoryBreakdown.slice(0, 6).map((cat) => (
                  <div 
                    key={cat.name}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-sm text-muted-foreground truncate">{cat.name}</span>
                    <span className="text-sm font-medium">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total Suppliers</p>
                  <p className="text-xl font-bold">{suppliers.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Outstanding</p>
                  <p className="text-xl font-bold">{formatCurrency(totalAmount, true)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Verified Rate</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-success">{verificationRate}%</p>
                    <TrendingUp className="w-4 h-4 text-success" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                  <p className="text-xl font-bold text-accent">{formatCurrency(totalPaid, true)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="glass-card overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search suppliers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20 w-48"
                    />
                  </div>
                  <div className="flex gap-1">
                    {['all', 'verified', 'active', 'suspended'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                          statusFilter === status 
                            ? 'bg-foreground text-background' 
                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintReport}
                    className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    title="Print Report"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export
                  </button>
                </div>
              </div>

              <DataTable
                data={filteredSuppliers}
                columns={columns}
                keyExtractor={(supplier) => supplier.id}
                onRowClick={(supplier) => setSelectedSupplier(supplier)}
              />

              <div className="p-3 border-t border-border bg-muted/20">
                <p className="text-xs text-muted-foreground text-center">
                  Showing {filteredSuppliers.length} of {suppliers.length} suppliers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Detail Modal */}
      {selectedSupplier && selectedSupplierStats && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSupplier(null)}
        >
          <div 
            className="bg-card border border-border rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                    <Users className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{selectedSupplier.name}</h2>
                    <p className="text-xs text-muted-foreground">{selectedSupplier.registrationNo}</p>
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
            
            <div className="p-4 space-y-4">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedSupplier.category}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedSupplier.county}
                  </p>
                </div>
              </div>

              {/* Live Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Bills</p>
                  <p className="text-xl font-bold">{selectedSupplierStats.totalBills}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Value</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedSupplierStats.totalAmount, true)}</p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Verified</p>
                  <p className="text-lg font-bold text-success">{formatCurrency(selectedSupplierStats.verifiedAmount, true)}</p>
                  <p className="text-xs text-success">{selectedSupplierStats.verifiedBills} bills</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-lg font-bold text-warning">{formatCurrency(selectedSupplierStats.pendingAmount, true)}</p>
                  <p className="text-xs text-warning">{selectedSupplierStats.pendingBills} bills</p>
                </div>
                {selectedSupplierStats.paidBills > 0 && (
                  <div className="p-3 bg-accent/10 rounded-lg col-span-2">
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="text-lg font-bold text-accent">{formatCurrency(selectedSupplierStats.paidAmount, true)}</p>
                    <p className="text-xs text-accent">{selectedSupplierStats.paidBills} bills settled</p>
                  </div>
                )}
              </div>

              {/* Verification Progress */}
              {selectedSupplierStats.totalAmount > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Bill Verification Progress</span>
                    <span className="font-medium">
                      {((selectedSupplierStats.verifiedAmount / selectedSupplierStats.totalAmount) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={(selectedSupplierStats.verifiedAmount / selectedSupplierStats.totalAmount) * 100} 
                    className="h-2" 
                  />
                </div>
              )}

              {/* Contact */}
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Contact</p>
                <a 
                  href={`mailto:${selectedSupplier.contactEmail}`}
                  className="flex items-center gap-2 text-sm font-medium hover:underline"
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
                    className="flex-1 px-4 py-2 bg-success text-success-foreground rounded-md text-sm font-medium hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Verify Supplier
                  </button>
                )}
                {selectedSupplier.status !== 'suspended' && (
                  <button
                    onClick={() => handleSuspendSupplier(selectedSupplier)}
                    className="px-4 py-2 bg-destructive/10 text-destructive rounded-md text-sm font-medium hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Ban className="w-4 h-4" />
                    Suspend
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewBills(selectedSupplier.id)}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  View Bills <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleUploadDocs(selectedSupplier.id)}
                  className="px-4 py-2 bg-secondary text-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Modal */}
      <DocumentModal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
        entityType="supplier"
        entityId={docSupplierId}
        title="Supplier Documents"
      />
    </div>
  );
};

export default SuppliersPage;
