import { useState, useMemo } from 'react';
import TopBar from '@/components/layout/TopBar';
import { 
  pendingBillsData, 
  monthlyTrends, 
  categoryBreakdown, 
  countyBreakdown,
  formatCurrency 
} from '@/data/mockData';
import { useData } from '@/contexts/DataContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { useState as useTabState } from 'react';
import { cn } from '@/lib/utils';
import { Download, FileText, TrendingUp, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { exportBillsToCSV, generateBillsSummaryReport } from '@/lib/exportUtils';

const COLORS = [
  'hsl(222, 47%, 20%)',
  'hsl(142, 76%, 36%)',
  'hsl(43, 96%, 56%)',
  'hsl(173, 58%, 39%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 51%)',
  'hsl(215, 16%, 47%)',
];

const tooltipStyle = {
  backgroundColor: 'hsl(0, 0%, 100%)',
  border: '1px solid hsl(220, 13%, 91%)',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

const gridColor = 'hsl(220, 13%, 91%)';
const axisColor = 'hsl(215, 16%, 47%)';

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'distribution' | 'trends' | 'geography'>('overview');
  const { bills, getStats } = useData();

  const stats = getStats();

  // Live stats from actual data
  const liveStats = useMemo(() => ({
    totalBills: stats.totalBills,
    totalAmount: stats.totalAmount,
    verifiedBills: stats.verifiedBills,
    verifiedAmount: stats.verifiedAmount,
    paidBills: stats.paidBills,
    paidAmount: stats.paidAmount,
    pendingBills: stats.pendingBills,
    pendingAmount: stats.pendingAmount,
    processingBills: stats.processingBills,
    processingAmount: stats.processingAmount,
  }), [stats]);

  // Status distribution from live data
  const statusDistribution = useMemo(() => [
    { name: 'Verified', value: stats.verifiedBills, amount: stats.verifiedAmount, color: 'hsl(142, 76%, 36%)' },
    { name: 'Processing', value: stats.processingBills, amount: stats.processingAmount, color: 'hsl(43, 96%, 56%)' },
    { name: 'Pending', value: stats.pendingBills, amount: stats.pendingAmount, color: 'hsl(38, 92%, 50%)' },
    { name: 'Paid', value: stats.paidBills, amount: stats.paidAmount, color: 'hsl(173, 58%, 39%)' },
  ], [stats]);

  // Category breakdown from live data
  const liveCategoryData = useMemo(() => {
    const categories: Record<string, { count: number; amount: number }> = {};
    bills.forEach(bill => {
      if (!categories[bill.category]) {
        categories[bill.category] = { count: 0, amount: 0 };
      }
      categories[bill.category].count++;
      categories[bill.category].amount += bill.amount;
    });
    return Object.entries(categories).map(([name, data], index) => ({
      name,
      bills: data.count,
      amount: data.amount / 1000000000,
      fill: COLORS[index % COLORS.length],
    }));
  }, [bills]);

  const rangeData = pendingBillsData.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  const handleExportCSV = () => {
    exportBillsToCSV(bills);
  };

  const handleExportReport = () => {
    generateBillsSummaryReport(bills);
  };

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Analytics" 
        subtitle="Deep dive into pending bills data"
      />
      
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'distribution', label: 'Distribution' },
              { id: 'trends', label: 'Trends' },
              { id: 'geography', label: 'Geography' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleExportReport}
              className="flex items-center gap-1.5 px-3 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Print Report
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics - Live Data */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold text-foreground">{liveStats.totalBills.toLocaleString()}</p>
                    <p className="text-muted-foreground text-sm">Total Bills</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <DollarSign className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold text-accent">{formatCurrency(liveStats.totalAmount, true)}</p>
                    <p className="text-muted-foreground text-sm">Total Value</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold text-success">{liveStats.verifiedBills.toLocaleString()}</p>
                    <p className="text-muted-foreground text-sm">Verified Bills</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold text-warning">{liveStats.pendingBills.toLocaleString()}</p>
                    <p className="text-muted-foreground text-sm">Pending Bills</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Distribution - Live */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-bold mb-4">Status Distribution (Live)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {statusDistribution.map((item) => (
                    <div key={item.name} className="text-center">
                      <div className="flex items-center gap-1.5 justify-center">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-muted-foreground">{item.name}</span>
                      </div>
                      <p className="text-sm font-semibold">{formatCurrency(item.amount, true)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-bold mb-4">Category Breakdown (Live)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={liveCategoryData} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal vertical={false} />
                      <XAxis type="number" stroke={axisColor} tick={{ fill: axisColor, fontSize: 11 }} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke={axisColor} 
                        tick={{ fill: axisColor, fontSize: 11 }}
                        width={80}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="bills" name="Bills" radius={[0, 4, 4, 0]}>
                        {liveCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bills by Amount Range */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold mb-4">Bills by Amount Range</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rangeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis 
                      dataKey="range" 
                      stroke={axisColor}
                      tick={{ fill: axisColor, fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke={axisColor}
                      tick={{ fill: axisColor, fontSize: 12 }}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="numberOfBills" name="Number of Bills" radius={[4, 4, 0, 0]}>
                      {rangeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'distribution' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Pie */}
              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-bold mb-4">Bills by Category</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="amount"
                        nameKey="category"
                        label={({ category, percentage }) => `${category}: ${percentage}%`}
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value: number) => [`KES ${value}B`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Bar */}
              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-bold mb-4">Category Breakdown</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryBreakdown} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis 
                        type="number"
                        stroke={axisColor}
                        tick={{ fill: axisColor }}
                      />
                      <YAxis 
                        type="category"
                        dataKey="category"
                        stroke={axisColor}
                        tick={{ fill: axisColor, fontSize: 12 }}
                        width={100}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="bills" name="Number of Bills" radius={[0, 4, 4, 0]}>
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold">Complete Range Analysis</h3>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left bg-muted/30">Range (KES)</th>
                      <th className="px-4 py-3 text-right bg-muted/30">Bills</th>
                      <th className="px-4 py-3 text-right bg-muted/30">Amount (B)</th>
                      <th className="px-4 py-3 text-right bg-muted/30">Cumulative Bills</th>
                      <th className="px-4 py-3 text-right bg-muted/30">Cumulative Value</th>
                      <th className="px-4 py-3 text-right bg-muted/30">% Number</th>
                      <th className="px-4 py-3 text-right bg-muted/30">% Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingBillsData.map((row, index) => (
                      <tr 
                        key={row.range}
                        className={cn(
                          "border-b border-border/50",
                          index < 3 && "bg-success/5"
                        )}
                      >
                        <td className="px-4 py-3 font-medium">
                          {row.range}
                          {index < 3 && <span className="ml-2 text-xs text-success">★ Phase 1</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">{row.numberOfBills.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono text-accent">{row.amountBillion.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">{row.cumulativeByNumber.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">{row.cumulativeByValue.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-mono">{row.percentByNumber}%</td>
                        <td className="px-4 py-3 text-right font-mono">{row.percentByValue}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold mb-4">Monthly Verification Trends</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis 
                      dataKey="month" 
                      stroke={axisColor}
                      tick={{ fill: axisColor, fontSize: 12 }}
                    />
                    <YAxis 
                      stroke={axisColor}
                      tick={{ fill: axisColor, fontSize: 12 }}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="verified" 
                      name="Verified" 
                      stroke="hsl(142, 76%, 36%)"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pending" 
                      name="Pending" 
                      stroke="hsl(38, 92%, 50%)"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="paid" 
                      name="Paid" 
                      stroke="hsl(173, 58%, 39%)"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold mb-4">Total Amount Trend (KES Billion)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis 
                      dataKey="month" 
                      stroke={axisColor}
                      tick={{ fill: axisColor, fontSize: 12 }}
                    />
                    <YAxis 
                      stroke={axisColor}
                      tick={{ fill: axisColor, fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: number) => [`KES ${value}B`]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="totalAmount" 
                      name="Total Amount" 
                      stroke="hsl(43, 96%, 56%)"
                      strokeWidth={2}
                      fill="hsl(43, 96%, 56%)"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'geography' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-bold mb-4">Bills by County</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={countyBreakdown} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis 
                        type="number"
                        stroke={axisColor}
                        tick={{ fill: axisColor }}
                      />
                      <YAxis 
                        type="category"
                        dataKey="county"
                        stroke={axisColor}
                        tick={{ fill: axisColor, fontSize: 12 }}
                        width={80}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="bills" name="Number of Bills" radius={[0, 4, 4, 0]}>
                        {countyBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-bold mb-4">Value by County (KES Billion)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={countyBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="amount"
                        nameKey="county"
                        label={({ county, amount }) => `${county}: ${amount}B`}
                      >
                        {countyBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* County Table */}
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">County Distribution</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left bg-muted/30">County</th>
                      <th className="px-4 py-3 text-right bg-muted/30">Bills</th>
                      <th className="px-4 py-3 text-right bg-muted/30">Amount (B)</th>
                      <th className="px-4 py-3 text-right bg-muted/30">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countyBreakdown.map((row) => (
                      <tr key={row.county} className="border-b border-border/50">
                        <td className="px-4 py-3 font-medium">{row.county}</td>
                        <td className="px-4 py-3 text-right font-mono">{row.bills.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono text-accent">KES {row.amount}B</td>
                        <td className="px-4 py-3 text-right font-mono">
                          {((row.bills / 28190) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
