import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import DataTable from '@/components/common/DataTable';
import { mdaData, MDA, formatCurrency, billsData } from '@/data/mockData';
import { useFilters } from '@/contexts/FilterContext';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown,
  Search,
  ArrowRight,
  BarChart3
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
    { name: 'Ministries', value: mdaData.filter(m => m.category === 'ministry').length, color: 'hsl(217, 91%, 45%)' },
    { name: 'Agencies', value: mdaData.filter(m => m.category === 'agency').length, color: 'hsl(173, 58%, 39%)' },
    { name: 'Counties', value: mdaData.filter(m => m.category === 'county').length, color: 'hsl(43, 96%, 56%)' },
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
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{mda.shortName}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{mda.name}</p>
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
          "px-2 py-1 rounded text-xs font-medium capitalize",
          mda.category === 'ministry' ? 'bg-primary/20 text-primary' :
          mda.category === 'agency' ? 'bg-secondary/20 text-secondary-foreground' :
          'bg-accent/20 text-accent'
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
        <span className="font-medium">{mda.totalBills.toLocaleString()}</span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Value',
      sortable: true,
      align: 'right' as const,
      render: (mda: MDA) => (
        <span className="font-semibold text-accent">{formatCurrency(mda.totalAmount, true)}</span>
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
          <div className="w-24">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
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
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
        >
          View Bills <ArrowRight className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const totalAmount = filteredMDAs.reduce((sum, mda) => sum + mda.totalAmount, 0);
  const totalBills = filteredMDAs.reduce((sum, mda) => sum + mda.totalBills, 0);

  return (
    <div className="min-h-screen">
      <TopBar 
        title="MDAs" 
        subtitle={`${filteredMDAs.length} Ministries, Departments & Agencies`}
      />
      
      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Total MDAs</p>
            <p className="text-2xl font-bold">{mdaData.length}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Bills</p>
            <p className="text-2xl font-bold">{totalBills.toLocaleString()}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Value</p>
            <p className="text-2xl font-bold text-accent">{formatCurrency(totalAmount, true)}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Avg Verification</p>
            <p className="text-2xl font-bold text-success">68.4%</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">Top MDAs by Value</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
                  <XAxis 
                    type="number"
                    stroke="hsl(215, 20%, 55%)"
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                    tickFormatter={(v) => `${v}B`}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    stroke="hsl(215, 20%, 55%)"
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 11%)',
                      border: '1px solid hsl(217, 33%, 20%)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`KES ${value.toFixed(1)}B`]}
                  />
                  <Bar dataKey="verified" stackId="a" fill="hsl(142, 76%, 36%)" name="Verified" />
                  <Bar dataKey="pending" stackId="a" fill="hsl(38, 92%, 50%)" name="Pending" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">By Category</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {categoryData.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setCategoryFilter(item.name.toLowerCase().slice(0, -1) === 'ministr' ? 'ministry' : item.name.toLowerCase().slice(0, -1) === 'agenc' ? 'agency' : 'county')}
                  className="flex items-center gap-2"
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters & Table */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search MDAs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'ministry', 'agency', 'county'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize",
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
