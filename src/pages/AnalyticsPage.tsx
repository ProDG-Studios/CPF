import TopBar from '@/components/layout/TopBar';
import { 
  pendingBillsData, 
  monthlyTrends, 
  categoryBreakdown, 
  countyBreakdown,
  totalStats 
} from '@/data/mockData';
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
  Legend,
  Treemap
} from 'recharts';
import { useState } from 'react';
import { cn } from '@/lib/utils';

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

  const rangeData = pendingBillsData.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  const treemapData = categoryBreakdown.map((item, index) => ({
    name: item.category,
    size: item.amount,
    bills: item.bills,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Analytics" 
        subtitle="Deep dive into pending bills data"
      />
      
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-6 text-center">
                <p className="text-4xl font-display font-bold text-foreground">{totalStats.totalBills.toLocaleString()}</p>
                <p className="text-muted-foreground mt-1">Total Bills</p>
              </div>
              <div className="glass-card p-6 text-center">
                <p className="text-4xl font-display font-bold text-accent">KES {totalStats.totalAmountBillion}B</p>
                <p className="text-muted-foreground mt-1">Total Value</p>
              </div>
              <div className="glass-card p-6 text-center">
                <p className="text-4xl font-display font-bold text-success">{totalStats.eligibleBills.toLocaleString()}</p>
                <p className="text-muted-foreground mt-1">Eligible (≤2M)</p>
              </div>
              <div className="glass-card p-6 text-center">
                <p className="text-4xl font-display font-bold text-secondary">KES {totalStats.eligibleAmountBillion}B</p>
                <p className="text-muted-foreground mt-1">Eligible Value</p>
              </div>
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-bold mb-4">Value by Amount Range (KES Billion)</h3>
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
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value: number) => [`KES ${value}B`]}
                      />
                      <Bar dataKey="amountBillion" name="Amount (Billion)" radius={[4, 4, 0, 0]}>
                        {rangeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Cumulative Chart */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold mb-4">Cumulative Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rangeData}>
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
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="percentByNumber" 
                      name="% by Number" 
                      stroke="hsl(222, 47%, 20%)"
                      fill="hsl(222, 47%, 20%)"
                      fillOpacity={0.2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="percentByValue" 
                      name="% by Value" 
                      stroke="hsl(43, 96%, 56%)"
                      strokeWidth={2}
                      dot
                    />
                  </AreaChart>
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
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Complete Range Analysis</h3>
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
                          {index < 3 && <span className="ml-2 text-xs text-success">★</span>}
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
                      <Bar dataKey="bills" name="Bills" fill="hsl(222, 47%, 20%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-bold mb-4">Value by County (KES Billion)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={countyBreakdown} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis 
                        type="number"
                        stroke={axisColor}
                        tick={{ fill: axisColor }}
                        tickFormatter={(v) => `${v}B`}
                      />
                      <YAxis 
                        type="category"
                        dataKey="county"
                        stroke={axisColor}
                        tick={{ fill: axisColor, fontSize: 12 }}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value: number) => [`KES ${value}B`]}
                      />
                      <Bar dataKey="amount" name="Amount" fill="hsl(43, 96%, 56%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* County Summary Table */}
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">County Distribution Summary</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left bg-muted/30">County</th>
                      <th className="px-4 py-3 text-right bg-muted/30">Bills</th>
                      <th className="px-4 py-3 text-right bg-muted/30">Amount (KES B)</th>
                      <th className="px-4 py-3 text-right bg-muted/30">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countyBreakdown.map((county) => (
                      <tr key={county.county} className="border-b border-border/50">
                        <td className="px-4 py-3 font-medium">{county.county}</td>
                        <td className="px-4 py-3 text-right font-mono">{county.bills.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono text-accent">{county.amount.toFixed(1)}</td>
                        <td className="px-4 py-3 text-right font-mono">
                          {((county.amount / totalStats.totalAmountBillion) * 100).toFixed(1)}%
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
