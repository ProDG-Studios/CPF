import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import DataTable from '@/components/common/DataTable';
import { mdaData, MDA, formatCurrency } from '@/data/mockData';
import { useFilters } from '@/contexts/FilterContext';
import { 
  Building2, 
  Search,
  ArrowRight,
  FileText,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { cn } from '@/lib/utils';

const MDAsPage = () => {
  const navigate = useNavigate();
  const { toggleArrayFilter } = useFilters();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMDA, setSelectedMDA] = useState<MDA | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredMDAs = useMemo(() => {
    return mdaData.filter(mda => {
      const matchesSearch = 
        mda.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mda.shortName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || mda.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, categoryFilter]);

  const chartData = [...mdaData]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 8)
    .map(mda => ({
      name: mda.shortName,
      total: mda.totalAmount / 1000000000,
      verified: mda.verifiedAmount / 1000000000,
      pending: mda.pendingAmount / 1000000000,
    }));

  const categoryData = [
    { name: 'Ministries', value: mdaData.filter(m => m.category === 'ministry').length, color: 'hsl(220, 60%, 15%)' },
    { name: 'Agencies', value: mdaData.filter(m => m.category === 'agency').length, color: 'hsl(210, 100%, 45%)' },
    { name: 'Counties', value: mdaData.filter(m => m.category === 'county').length, color: 'hsl(152, 70%, 35%)' },
  ];

  const handleMDAClick = (mda: MDA) => {
    setSelectedMDA(mda);
  };

  const handleViewBills = (mdaId: string) => {
    toggleArrayFilter('mdaIds', mdaId);
    navigate('/bills');
  };

  const columns = [
    {
      key: 'name',
      header: 'MDA Name',
      sortable: true,
      render: (mda: MDA) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">{mda.shortName}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{mda.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Type',
      sortable: true,
      render: (mda: MDA) => (
        <span className={cn(
          "px-2 py-0.5 rounded text-xs font-medium capitalize",
          mda.category === 'ministry' ? 'bg-primary/10 text-primary' :
          mda.category === 'agency' ? 'bg-accent/10 text-accent' :
          'bg-success/10 text-success'
        )}>
          {mda.category}
        </span>
      ),
    },
    {
      key: 'totalBills',
      header: 'Bills',
      sortable: true,
      align: 'right' as const,
      render: (mda: MDA) => (
        <span className="font-medium text-foreground">{mda.totalBills.toLocaleString()}</span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Value',
      sortable: true,
      align: 'right' as const,
      render: (mda: MDA) => (
        <span className="font-semibold text-foreground">{formatCurrency(mda.totalAmount, true)}</span>
      ),
    },
    {
      key: 'verifiedAmount',
      header: 'Verified',
      sortable: true,
      align: 'right' as const,
      render: (mda: MDA) => {
        const percentage = (mda.verifiedAmount / mda.totalAmount) * 100;
        return (
          <div className="text-right">
            <span className="font-medium text-success">{formatCurrency(mda.verifiedAmount, true)}</span>
            <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</p>
          </div>
        );
      },
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (mda: MDA) => {
        const percentage = (mda.verifiedAmount / mda.totalAmount) * 100;
        return (
          <div className="w-20">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-success rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      render: (mda: MDA) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleViewBills(mda.id);
          }}
          className="flex items-center gap-1 text-xs text-accent font-medium hover:underline"
        >
          View <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  const totalAmount = filteredMDAs.reduce((sum, mda) => sum + mda.totalAmount, 0);
  const totalBills = filteredMDAs.reduce((sum, mda) => sum + mda.totalBills, 0);
  const totalVerified = filteredMDAs.reduce((sum, mda) => sum + mda.verifiedAmount, 0);

  return (
    <div className="min-h-screen bg-background">
      <TopBar 
        title="MDAs" 
        subtitle={`${filteredMDAs.length} Ministries, Departments & Agencies`}
      />
      
      <div className="p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-primary/10">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mdaData.length}</p>
                <p className="text-xs text-muted-foreground">Total MDAs</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-accent/10">
                <FileText className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalBills.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Bills</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-warning/10">
                <DollarSign className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalAmount, true)}</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-success/10">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{formatCurrency(totalVerified, true)}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-5">
            <h3 className="font-semibold text-foreground mb-4">Top MDAs by Value</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 50, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 90%)" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number"
                    stroke="hsl(220, 10%, 45%)"
                    tick={{ fill: 'hsl(220, 10%, 45%)', fontSize: 11 }}
                    tickFormatter={(v) => `${v}B`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    stroke="hsl(220, 10%, 45%)"
                    tick={{ fill: 'hsl(220, 10%, 45%)', fontSize: 11 }}
                    width={50}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(220, 14%, 90%)',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`KES ${value.toFixed(1)}B`]}
                  />
                  <Bar dataKey="verified" stackId="a" fill="hsl(152, 70%, 35%)" name="Verified" />
                  <Bar dataKey="pending" stackId="a" fill="hsl(38, 95%, 50%)" name="Pending" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-foreground mb-4">By Category</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(220, 14%, 90%)',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-3">
              {categoryData.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setCategoryFilter(item.name.toLowerCase().slice(0, -1) === 'ministr' ? 'ministry' : item.name.toLowerCase().slice(0, -1) === 'agenc' ? 'agency' : 'county')}
                  className="flex items-center gap-1.5"
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters & Table */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search MDAs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-muted border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent w-56"
                />
              </div>
              <div className="flex gap-1">
                {['all', 'ministry', 'agency', 'county'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded text-xs font-medium transition-colors capitalize",
                      categoryFilter === cat 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredMDAs.length} of {mdaData.length} MDAs
            </p>
          </div>

          <DataTable
            data={filteredMDAs}
            columns={columns}
            keyExtractor={(mda) => mda.id}
            onRowClick={handleMDAClick}
          />
        </div>
      </div>
    </div>
  );
};

export default MDAsPage;
