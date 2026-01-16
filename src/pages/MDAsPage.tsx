import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import DataTable from '@/components/common/DataTable';
import { MDA, formatCurrency } from '@/data/mockData';
import { useFilters } from '@/contexts/FilterContext';
import { useData } from '@/contexts/DataContext';
import { Building2, Search, ArrowRight, Download, Eye, FileText, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { exportMDAsToCSV } from '@/lib/exportUtils';
import { DocumentModal } from '@/components/common/DocumentUpload';
import { Progress } from '@/components/ui/progress';

const MDAsPage = () => {
  const navigate = useNavigate();
  const { toggleArrayFilter } = useFilters();
  const { mdas, bills, paymentSchedules } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedMDA, setSelectedMDA] = useState<MDA | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [docMDAId, setDocMDAId] = useState<string>('');

  const filteredMDAs = useMemo(() => {
    return mdas.filter(mda => {
      const matchesSearch = mda.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mda.shortName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || mda.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [mdas, searchTerm, categoryFilter]);

  // Calculate live MDA stats from bills
  const getMDAStats = (mdaId: string) => {
    const mdaBills = bills.filter(b => b.mdaId === mdaId);
    return {
      totalBills: mdaBills.length,
      totalAmount: mdaBills.reduce((sum, b) => sum + b.amount, 0),
      verifiedBills: mdaBills.filter(b => b.status === 'verified').length,
      verifiedAmount: mdaBills.filter(b => b.status === 'verified').reduce((sum, b) => sum + b.amount, 0),
      pendingBills: mdaBills.filter(b => b.status === 'pending').length,
      paidBills: mdaBills.filter(b => b.status === 'paid').length,
      paidAmount: mdaBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0),
    };
  };

  // Get payment schedule for MDA
  const getMDAPaymentSchedule = (mdaId: string) => {
    return paymentSchedules.find(ps => ps.mdaId === mdaId);
  };

  const chartData = [...mdas]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 8)
    .map(mda => ({
      name: mda.shortName,
      verified: mda.verifiedAmount / 1000000000,
      pending: mda.pendingAmount / 1000000000,
    }));

  const categoryData = [
    { name: 'Ministries', value: mdas.filter(m => m.category === 'ministry').length, color: 'hsl(220, 25%, 12%)' },
    { name: 'Agencies', value: mdas.filter(m => m.category === 'agency').length, color: 'hsl(174, 72%, 45%)' },
    { name: 'Counties', value: mdas.filter(m => m.category === 'county').length, color: 'hsl(142, 76%, 36%)' },
  ];

  const handleViewBills = (mdaId: string) => {
    toggleArrayFilter('mdaIds', mdaId);
    navigate('/bills');
  };

  const handleViewPaymentSchedule = (mdaId: string) => {
    navigate('/payment-schedule');
  };

  const handleExport = () => {
    exportMDAsToCSV(filteredMDAs);
  };

  const handleUploadDocs = (mdaId: string) => {
    setDocMDAId(mdaId);
    setShowDocModal(true);
  };

  const columns = [
    {
      key: 'name',
      header: 'MDA Name',
      sortable: true,
      render: (mda: MDA) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">{mda.shortName}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[160px]">{mda.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Type',
      sortable: true,
      render: (mda: MDA) => (
        <span className="px-2 py-0.5 rounded text-xs font-medium capitalize bg-secondary text-muted-foreground">
          {mda.category}
        </span>
      ),
    },
    {
      key: 'totalBills',
      header: 'Bills',
      sortable: true,
      align: 'right' as const,
      render: (mda: MDA) => {
        const stats = getMDAStats(mda.id);
        return (
          <div className="text-right">
            <span className="font-medium">{mda.totalBills.toLocaleString()}</span>
            {stats.pendingBills > 0 && (
              <p className="text-xs text-warning">{stats.pendingBills} pending</p>
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
      render: (mda: MDA) => <span className="font-medium">{formatCurrency(mda.totalAmount, true)}</span>,
    },
    {
      key: 'verifiedAmount',
      header: 'Verified',
      sortable: true,
      align: 'right' as const,
      render: (mda: MDA) => {
        const pct = (mda.verifiedAmount / mda.totalAmount) * 100;
        return (
          <div className="text-right">
            <span className="font-medium text-success">{formatCurrency(mda.verifiedAmount, true)}</span>
            <p className="text-xs text-muted-foreground">{pct.toFixed(0)}%</p>
          </div>
        );
      },
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (mda: MDA) => {
        const pct = (mda.verifiedAmount / mda.totalAmount) * 100;
        return (
          <div className="w-20">
            <Progress value={pct} className="h-1.5" />
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      render: (mda: MDA) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedMDA(mda); }}
            className="p-1.5 hover:bg-secondary rounded-md transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-muted-foreground" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleViewBills(mda.id); }}
            className="text-xs text-muted-foreground font-medium flex items-center gap-1 hover:text-foreground p-1.5"
          >
            Bills <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      ),
    },
  ];

  const totalAmount = filteredMDAs.reduce((sum, mda) => sum + mda.totalAmount, 0);
  const totalBills = filteredMDAs.reduce((sum, mda) => sum + mda.totalBills, 0);
  const totalVerified = filteredMDAs.reduce((sum, mda) => sum + mda.verifiedAmount, 0);

  return (
    <div className="min-h-screen">
      <TopBar title="MDAs" subtitle={`${filteredMDAs.length} Ministries, Departments & Agencies`} />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total MDAs', value: mdas.length },
            { label: 'Total Bills', value: totalBills.toLocaleString() },
            { label: 'Total Value', value: formatCurrency(totalAmount, true) },
            { label: 'Verified', value: formatCurrency(totalVerified, true) },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4">
              <p className="text-xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-5">
            <h3 className="font-semibold text-foreground mb-4">Top MDAs by Value</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" horizontal vertical={false} />
                  <XAxis type="number" tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}B`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 11 }} width={50} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(220, 15%, 88%)', borderRadius: '6px', fontSize: '12px' }} />
                  <Bar dataKey="verified" stackId="a" fill="hsl(142, 76%, 36%)" name="Verified" />
                  <Bar dataKey="pending" stackId="a" fill="hsl(40, 85%, 55%)" name="Pending" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-foreground mb-4">By Category</h3>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value">
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(220, 15%, 88%)', borderRadius: '6px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20 w-48"
                />
              </div>
              <div className="flex gap-1">
                {['all', 'ministry', 'agency', 'county'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                      categoryFilter === cat ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <p className="text-xs text-muted-foreground">{filteredMDAs.length} of {mdas.length}</p>
            </div>
          </div>
          <DataTable 
            data={filteredMDAs} 
            columns={columns} 
            keyExtractor={(mda) => mda.id}
            onRowClick={(mda) => setSelectedMDA(mda)}
          />
        </div>
      </div>

      {/* MDA Detail Modal */}
      {selectedMDA && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMDA(null)}
        >
          <div 
            className="bg-card border border-border rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">{selectedMDA.name}</h2>
                  <p className="text-xs text-muted-foreground capitalize">{selectedMDA.category}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Bills</p>
                  <p className="text-xl font-bold">{selectedMDA.totalBills.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Value</p>
                  <p className="text-xl font-bold text-accent">{formatCurrency(selectedMDA.totalAmount, true)}</p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Verified</p>
                  <p className="text-lg font-bold text-success">{formatCurrency(selectedMDA.verifiedAmount, true)}</p>
                  <p className="text-xs text-success">{selectedMDA.verifiedBills} bills</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-lg font-bold text-warning">{formatCurrency(selectedMDA.pendingAmount, true)}</p>
                  <p className="text-xs text-warning">{selectedMDA.pendingBills} bills</p>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Verification Progress</span>
                  <span className="font-medium">{((selectedMDA.verifiedAmount / selectedMDA.totalAmount) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(selectedMDA.verifiedAmount / selectedMDA.totalAmount) * 100} className="h-2" />
              </div>

              {/* Payment Schedule Link */}
              {getMDAPaymentSchedule(selectedMDA.id) && (
                <div className="p-3 bg-accent/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-accent">Payment Schedule Active</p>
                      <p className="text-xs text-muted-foreground">View quarterly payment plan</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-accent" />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewBills(selectedMDA.id)}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  View Bills <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleUploadDocs(selectedMDA.id)}
                  className="px-4 py-2 bg-secondary text-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Documents
                </button>
              </div>

              {getMDAPaymentSchedule(selectedMDA.id) && (
                <button
                  onClick={() => handleViewPaymentSchedule(selectedMDA.id)}
                  className="w-full px-4 py-2 bg-accent/10 text-accent rounded-md text-sm font-medium hover:bg-accent/20 transition-colors"
                >
                  View Payment Schedule
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Modal */}
      <DocumentModal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
        entityType="mda"
        entityId={docMDAId}
        title="MDA Documents"
      />
    </div>
  );
};

export default MDAsPage;
