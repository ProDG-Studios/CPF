import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import DataTable from '@/components/common/DataTable';
import { mdaData, MDA, formatCurrency } from '@/data/mockData';
import { useFilters } from '@/contexts/FilterContext';
import { Building2, Search, ArrowRight, FileText, DollarSign, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';

const MDAsPage = () => {
  const navigate = useNavigate();
  const { toggleArrayFilter } = useFilters();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredMDAs = useMemo(() => {
    return mdaData.filter(mda => {
      const matchesSearch = mda.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      verified: mda.verifiedAmount / 1000000000,
      pending: mda.pendingAmount / 1000000000,
    }));

  const categoryData = [
    { name: 'Ministries', value: mdaData.filter(m => m.category === 'ministry').length, color: 'hsl(220, 20%, 18%)' },
    { name: 'Agencies', value: mdaData.filter(m => m.category === 'agency').length, color: 'hsl(180, 45%, 40%)' },
    { name: 'Counties', value: mdaData.filter(m => m.category === 'county').length, color: 'hsl(160, 50%, 40%)' },
  ];

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
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
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
        <span className={cn(
          "px-2 py-0.5 rounded text-xs font-medium capitalize",
          mda.category === 'ministry' ? 'bg-primary/10 text-primary' :
          mda.category === 'agency' ? 'bg-accent/10 text-accent' : 'bg-success/10 text-success'
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
      render: (mda: MDA) => <span className="font-medium">{mda.totalBills.toLocaleString()}</span>,
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
          <div className="w-16">
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
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
          onClick={(e) => { e.stopPropagation(); handleViewBills(mda.id); }}
          className="text-xs text-accent font-medium flex items-center gap-1 hover:underline"
        >
          View <ArrowRight className="w-3 h-3" />
        </button>
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
            { icon: Building2, label: 'Total MDAs', value: mdaData.length, color: 'primary' },
            { icon: FileText, label: 'Total Bills', value: totalBills.toLocaleString(), color: 'accent' },
            { icon: DollarSign, label: 'Total Value', value: formatCurrency(totalAmount, true), color: 'warning' },
            { icon: CheckCircle, label: 'Verified', value: formatCurrency(totalVerified, true), color: 'success' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md bg-${stat.color}/10`}>
                  <stat.icon className={`w-4 h-4 text-${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
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
                  <Bar dataKey="verified" stackId="a" fill="hsl(160, 50%, 40%)" name="Verified" />
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
                  className="pl-8 pr-3 py-1.5 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-accent w-48"
                />
              </div>
              <div className="flex gap-1">
                {['all', 'ministry', 'agency', 'county'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                      categoryFilter === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{filteredMDAs.length} of {mdaData.length}</p>
          </div>
          <DataTable data={filteredMDAs} columns={columns} keyExtractor={(mda) => mda.id} />
        </div>
      </div>
    </div>
  );
};

export default MDAsPage;
