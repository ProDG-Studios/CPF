import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import { formatCurrency } from '@/data/mockData';
import { useData } from '@/contexts/DataContext';
import { useFilters } from '@/contexts/FilterContext';
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
import { cn } from '@/lib/utils';
import { Download, FileText, TrendingUp, DollarSign, CheckCircle, Clock, Printer, ArrowRight, Banknote } from 'lucide-react';
import { generateCSV, generatePrintableReport } from '@/lib/exportUtils';
import { Progress } from '@/components/ui/progress';

const COLORS = [
  'hsl(262, 90%, 50%)',   // Vivid purple
  'hsl(142, 85%, 35%)',   // Rich green
  'hsl(199, 95%, 45%)',   // Strong blue
  'hsl(45, 100%, 50%)',   // Vivid yellow
  'hsl(339, 90%, 45%)',   // Deep pink
  'hsl(173, 90%, 35%)',   // Rich teal
  'hsl(25, 100%, 50%)',   // Bright orange
  'hsl(280, 90%, 55%)',   // Bright violet
];

const STATUS_COLORS = {
  verified: 'hsl(142, 85%, 35%)',   // Rich green
  processing: 'hsl(45, 100%, 50%)', // Vivid yellow
  pending: 'hsl(25, 100%, 50%)',    // Bright orange
  paid: 'hsl(199, 95%, 45%)',       // Strong blue
};

const tooltipStyle = {
  backgroundColor: 'hsl(0, 0%, 100%)',
  border: '1px solid hsl(220, 13%, 91%)',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  fontSize: '12px',
};

const gridColor = 'hsl(220, 13%, 91%)';
const axisColor = 'hsl(215, 16%, 47%)';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'distribution' | 'trends' | 'geography'>('overview');
  const { bills, mdas, suppliers, getStats } = useData();
  const { toggleArrayFilter } = useFilters();

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
    { name: 'Verified', value: stats.verifiedBills, amount: stats.verifiedAmount, color: STATUS_COLORS.verified },
    { name: 'Processing', value: stats.processingBills, amount: stats.processingAmount, color: STATUS_COLORS.processing },
    { name: 'Pending', value: stats.pendingBills, amount: stats.pendingAmount, color: STATUS_COLORS.pending },
    { name: 'Paid', value: stats.paidBills, amount: stats.paidAmount, color: STATUS_COLORS.paid },
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
    return Object.entries(categories)
      .map(([name, data], index) => ({
        name,
        bills: data.count,
        amount: data.amount / 1000000000,
        rawAmount: data.amount,
        fill: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.bills - a.bills);
  }, [bills]);

  // MDA breakdown from live data
  const liveMDAData = useMemo(() => {
    return mdas.map(mda => {
      const mdaBills = bills.filter(b => b.mdaId === mda.id);
      return {
        id: mda.id,
        name: mda.shortName,
        fullName: mda.name,
        bills: mdaBills.length,
        amount: mdaBills.reduce((sum, b) => sum + b.amount, 0) / 1000000000,
        rawAmount: mdaBills.reduce((sum, b) => sum + b.amount, 0),
        verified: mdaBills.filter(b => b.status === 'verified' || b.status === 'paid').reduce((sum, b) => sum + b.amount, 0),
      };
    }).filter(m => m.bills > 0).sort((a, b) => b.rawAmount - a.rawAmount).slice(0, 10);
  }, [mdas, bills]);

  // Supplier breakdown from live data
  const liveSupplierData = useMemo(() => {
    return suppliers.map(supplier => {
      const supplierBills = bills.filter(b => b.supplierId === supplier.id);
      return {
        id: supplier.id,
        name: supplier.name,
        category: supplier.category,
        bills: supplierBills.length,
        amount: supplierBills.reduce((sum, b) => sum + b.amount, 0) / 1000000000,
        rawAmount: supplierBills.reduce((sum, b) => sum + b.amount, 0),
      };
    }).filter(s => s.bills > 0).sort((a, b) => b.rawAmount - a.rawAmount).slice(0, 10);
  }, [suppliers, bills]);

  // Amount range breakdown from live data
  const amountRangeData = useMemo(() => {
    const ranges = [
      { min: 0, max: 100000, label: '0 - 100K' },
      { min: 100000, max: 500000, label: '100K - 500K' },
      { min: 500000, max: 1000000, label: '500K - 1M' },
      { min: 1000000, max: 5000000, label: '1M - 5M' },
      { min: 5000000, max: 10000000, label: '5M - 10M' },
      { min: 10000000, max: 50000000, label: '10M - 50M' },
      { min: 50000000, max: 100000000, label: '50M - 100M' },
      { min: 100000000, max: Infinity, label: '100M+' },
    ];

    let cumulativeBills = 0;
    let cumulativeAmount = 0;

    return ranges.map((range, index) => {
      const rangeBills = bills.filter(b => b.amount >= range.min && b.amount < range.max);
      const count = rangeBills.length;
      const amount = rangeBills.reduce((sum, b) => sum + b.amount, 0);
      cumulativeBills += count;
      cumulativeAmount += amount;

      return {
        range: range.label,
        numberOfBills: count,
        amountBillion: amount / 1000000000,
        cumulativeByNumber: cumulativeBills,
        cumulativeByValue: cumulativeAmount / 1000000000,
        percentByNumber: liveStats.totalBills > 0 ? ((count / liveStats.totalBills) * 100).toFixed(1) : '0',
        percentByValue: liveStats.totalAmount > 0 ? ((amount / liveStats.totalAmount) * 100).toFixed(1) : '0',
        fill: COLORS[index % COLORS.length],
      };
    }).filter(r => r.numberOfBills > 0);
  }, [bills, liveStats]);

  // Monthly trends from live data (simulated based on bill dates)
  const monthlyTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.slice(0, 8).map((month, index) => {
      // Simulate trend data based on current stats with some variation
      const factor = 0.7 + (index * 0.05);
      return {
        month,
        verified: Math.round(liveStats.verifiedBills * factor * (0.8 + Math.random() * 0.4)),
        pending: Math.round(liveStats.pendingBills * (1 - factor * 0.3) * (0.8 + Math.random() * 0.4)),
        paid: Math.round(liveStats.paidBills * factor * (0.8 + Math.random() * 0.4)),
        totalAmount: (liveStats.totalAmount / 1000000000) * factor * (0.9 + Math.random() * 0.2),
      };
    });
  }, [liveStats]);

  // County breakdown from live data
  const liveCountyData = useMemo(() => {
    const counties: Record<string, { bills: number; amount: number }> = {};
    bills.forEach(bill => {
      const supplier = suppliers.find(s => s.id === bill.supplierId);
      const county = supplier?.county || 'Unknown';
      if (!counties[county]) {
        counties[county] = { bills: 0, amount: 0 };
      }
      counties[county].bills++;
      counties[county].amount += bill.amount;
    });
    return Object.entries(counties)
      .map(([county, data]) => ({
        county,
        bills: data.bills,
        amount: data.amount / 1000000000,
        rawAmount: data.amount,
      }))
      .sort((a, b) => b.rawAmount - a.rawAmount)
      .slice(0, 10);
  }, [bills, suppliers]);

  const handleExportCSV = () => {
    generateCSV(
      bills.map(b => ({
        'Bill ID': b.id,
        'Supplier': b.supplierName,
        'MDA': b.mdaName,
        'Category': b.category,
        'Amount': b.amount,
        'Status': b.status,
        'Due Date': b.dueDate,
      })),
      'analytics_bills_export'
    );
  };

  const handleExportReport = () => {
    const content = `
      <div style="margin-bottom: 24px;">
        <h2 style="margin-bottom: 16px; color: #333;">Executive Summary</h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
          <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
            <p style="font-size: 28px; font-weight: bold; margin: 0;">${liveStats.totalBills.toLocaleString()}</p>
            <p style="color: #666; margin: 4px 0 0;">Total Bills</p>
          </div>
          <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
            <p style="font-size: 28px; font-weight: bold; margin: 0;">${formatCurrency(liveStats.totalAmount, true)}</p>
            <p style="color: #666; margin: 4px 0 0;">Total Value</p>
          </div>
          <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
            <p style="font-size: 28px; font-weight: bold; color: #22c55e; margin: 0;">${formatCurrency(liveStats.verifiedAmount, true)}</p>
            <p style="color: #666; margin: 4px 0 0;">Verified Value</p>
          </div>
          <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
            <p style="font-size: 28px; font-weight: bold; color: #3b82f6; margin: 0;">${formatCurrency(liveStats.paidAmount, true)}</p>
            <p style="color: #666; margin: 4px 0 0;">Paid Value</p>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 24px;">
        <h2 style="margin-bottom: 16px; color: #333;">Status Breakdown</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Status</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Bills</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Amount</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">% of Total</th>
            </tr>
          </thead>
          <tbody>
            ${statusDistribution.map(s => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${s.name}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${s.value.toLocaleString()}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatCurrency(s.amount, true)}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${liveStats.totalAmount > 0 ? ((s.amount / liveStats.totalAmount) * 100).toFixed(1) : 0}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div style="margin-bottom: 24px;">
        <h2 style="margin-bottom: 16px; color: #333;">Top Categories</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Category</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Bills</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${liveCategoryData.slice(0, 8).map(c => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${c.name}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${c.bills.toLocaleString()}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatCurrency(c.rawAmount, true)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    generatePrintableReport('Analytics Summary Report', content);
  };

  const handleMDAClick = (mdaId: string) => {
    toggleArrayFilter('mdaIds', mdaId);
    navigate('/bills');
  };

  const handleSupplierClick = (supplierId: string) => {
    toggleArrayFilter('supplierIds', supplierId);
    navigate('/bills');
  };

  const verificationRate = liveStats.totalAmount > 0 
    ? ((liveStats.verifiedAmount / liveStats.totalAmount) * 100).toFixed(1) 
    : '0';

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Analytics" 
        subtitle="Live insights from pending bills data"
      />
      
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 overflow-x-auto pb-2">
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
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  activeTab === tab.id 
                    ? 'bg-foreground text-background' 
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleExportReport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics - Live Data with bold colors */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="glass-card p-5 border-l-4 border-l-[hsl(262,90%,50%)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-[hsl(262,90%,50%)]/15">
                    <FileText className="w-5 h-5 text-[hsl(262,90%,50%)]" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{liveStats.totalBills.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Bills</p>
              </div>
              <div className="glass-card p-5 border-l-4 border-l-[hsl(339,90%,45%)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-[hsl(339,90%,45%)]/15">
                    <DollarSign className="w-5 h-5 text-[hsl(339,90%,45%)]" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[hsl(339,90%,45%)]">{formatCurrency(liveStats.totalAmount, true)}</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
              <div className="glass-card p-5 border-l-4 border-l-[hsl(142,85%,35%)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-[hsl(142,85%,35%)]/15">
                    <CheckCircle className="w-5 h-5 text-[hsl(142,85%,35%)]" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[hsl(142,85%,35%)]">{liveStats.verifiedBills.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Verified Bills</p>
              </div>
              <div className="glass-card p-5 border-l-4 border-l-[hsl(25,100%,50%)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-[hsl(25,100%,50%)]/15">
                    <Clock className="w-5 h-5 text-[hsl(25,100%,50%)]" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[hsl(25,100%,50%)]">{liveStats.pendingBills.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Pending Bills</p>
              </div>
              <div className="glass-card p-5 border-l-4 border-l-[hsl(199,95%,45%)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-[hsl(199,95%,45%)]/15">
                    <Banknote className="w-5 h-5 text-[hsl(199,95%,45%)]" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[hsl(199,95%,45%)]">{formatCurrency(liveStats.paidAmount, true)}</p>
                <p className="text-xs text-muted-foreground">Paid Amount</p>
              </div>
            </div>

            {/* Verification Progress - solid color */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">Overall Verification Progress</h3>
                  <p className="text-xs text-muted-foreground">Live tracking of bill verification status</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(142,85%,35%)]/15">
                  <TrendingUp className="w-4 h-4 text-[hsl(142,85%,35%)]" />
                  <span className="text-lg font-bold text-[hsl(142,85%,35%)]">{verificationRate}%</span>
                </div>
              </div>
              <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-[hsl(142,85%,35%)] rounded-full transition-all duration-500"
                  style={{ width: `${verificationRate}%` }}
                />
              </div>
              <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                <span>Verified: {formatCurrency(liveStats.verifiedAmount, true)}</span>
                <span>Remaining: {formatCurrency(liveStats.totalAmount - liveStats.verifiedAmount, true)}</span>
              </div>
            </div>

            {/* Status Distribution - Live */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-5">
                <h3 className="font-semibold text-foreground mb-4">Status Distribution (Live)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
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
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {statusDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold">{formatCurrency(item.amount, true)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-5">
                <h3 className="font-semibold text-foreground mb-4">Category Breakdown (Live)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={liveCategoryData.slice(0, 6)} layout="vertical" margin={{ left: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal vertical={false} />
                      <XAxis type="number" stroke={axisColor} tick={{ fill: axisColor, fontSize: 11 }} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke={axisColor} 
                        tick={{ fill: axisColor, fontSize: 11 }}
                        width={60}
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

            {/* Top MDAs and Suppliers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Top MDAs by Value</h3>
                  <button 
                    onClick={() => navigate('/mdas')}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {liveMDAData.slice(0, 5).map((mda, index) => (
                    <button
                      key={mda.id}
                      onClick={() => handleMDAClick(mda.id)}
                      className="w-full flex items-center justify-between p-2.5 rounded-md hover:bg-secondary transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-secondary flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium truncate">{mda.name}</span>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(mda.rawAmount, true)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Top Suppliers by Value</h3>
                  <button 
                    onClick={() => navigate('/suppliers')}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {liveSupplierData.slice(0, 5).map((supplier, index) => (
                    <button
                      key={supplier.id}
                      onClick={() => handleSupplierClick(supplier.id)}
                      className="w-full flex items-center justify-between p-2.5 rounded-md hover:bg-secondary transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-secondary flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </span>
                        <div>
                          <span className="text-sm font-medium truncate block">{supplier.name}</span>
                          <span className="text-xs text-muted-foreground">{supplier.category}</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(supplier.rawAmount, true)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'distribution' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Pie */}
              <div className="glass-card p-5">
                <h3 className="font-semibold text-foreground mb-4">Bills by Category (Live)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={liveCategoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="bills"
                        nameKey="name"
                        label={({ name, bills }) => `${name}: ${bills}`}
                      >
                        {liveCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Bar */}
              <div className="glass-card p-5">
                <h3 className="font-semibold text-foreground mb-4">Value by Category (Live)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={liveCategoryData} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis 
                        type="number"
                        stroke={axisColor}
                        tick={{ fill: axisColor, fontSize: 11 }}
                        tickFormatter={(v) => `${v.toFixed(1)}B`}
                      />
                      <YAxis 
                        type="category"
                        dataKey="name"
                        stroke={axisColor}
                        tick={{ fill: axisColor, fontSize: 11 }}
                        width={80}
                      />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `KES ${v.toFixed(2)}B`} />
                      <Bar dataKey="amount" name="Amount (Billion)" radius={[0, 4, 4, 0]}>
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
            <div className="glass-card p-5">
              <h3 className="font-semibold text-foreground mb-4">Bills by Amount Range (Live)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={amountRangeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis 
                      dataKey="range" 
                      stroke={axisColor}
                      tick={{ fill: axisColor, fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke={axisColor}
                      tick={{ fill: axisColor, fontSize: 11 }}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="numberOfBills" name="Number of Bills" radius={[4, 4, 0, 0]}>
                      {amountRangeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Data Table */}
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold">Range Analysis (Live)</h3>
                <button
                  onClick={() => generateCSV(amountRangeData.map(r => ({
                    Range: r.range,
                    Bills: r.numberOfBills,
                    'Amount (B)': r.amountBillion.toFixed(2),
                    '% by Number': r.percentByNumber,
                    '% by Value': r.percentByValue,
                  })), 'range_analysis')}
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
                    {amountRangeData.map((row) => (
                      <tr key={row.range} className="border-b border-border/50">
                        <td className="px-4 py-3 font-medium">{row.range}</td>
                        <td className="px-4 py-3 text-right font-mono">{row.numberOfBills.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono">{row.amountBillion.toFixed(2)}</td>
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
            <div className="glass-card p-5">
              <h3 className="font-semibold text-foreground mb-4">Monthly Verification Trends</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis 
                      dataKey="month" 
                      stroke={axisColor}
                      tick={{ fill: axisColor, fontSize: 11 }}
                    />
                    <YAxis 
                      stroke={axisColor}
                      tick={{ fill: axisColor, fontSize: 11 }}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="verified" 
                      name="Verified" 
                      stroke={STATUS_COLORS.verified}
                      strokeWidth={3}
                      dot={{ r: 4, fill: STATUS_COLORS.verified }}
                      activeDot={{ r: 6, stroke: STATUS_COLORS.verified, strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pending" 
                      name="Pending" 
                      stroke={STATUS_COLORS.pending}
                      strokeWidth={3}
                      dot={{ r: 4, fill: STATUS_COLORS.pending }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="paid" 
                      name="Paid" 
                      stroke={STATUS_COLORS.paid}
                      strokeWidth={3}
                      dot={{ r: 4, fill: STATUS_COLORS.paid }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="font-semibold text-foreground mb-4">Total Amount Trend (KES Billion)</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis 
                      dataKey="month" 
                      stroke={axisColor}
                      tick={{ fill: axisColor, fontSize: 11 }}
                    />
                    <YAxis 
                      stroke={axisColor}
                      tick={{ fill: axisColor, fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: number) => [`KES ${value.toFixed(1)}B`]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="totalAmount" 
                      name="Total Amount" 
                      stroke="hsl(262, 90%, 50%)"
                      strokeWidth={3}
                      fill="hsl(262, 90%, 50%)"
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
              <div className="glass-card p-5">
                <h3 className="font-semibold text-foreground mb-4">Bills by County (Live)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={liveCountyData} layout="vertical" margin={{ left: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis 
                        type="number"
                        stroke={axisColor}
                        tick={{ fill: axisColor, fontSize: 11 }}
                      />
                      <YAxis 
                        type="category"
                        dataKey="county"
                        stroke={axisColor}
                        tick={{ fill: axisColor, fontSize: 11 }}
                        width={60}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="bills" name="Number of Bills" radius={[0, 4, 4, 0]}>
                        {liveCountyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-5">
                <h3 className="font-semibold text-foreground mb-4">Value by County (Live)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={liveCountyData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="amount"
                        nameKey="county"
                        label={({ county, amount }) => `${county}: ${amount.toFixed(1)}B`}
                      >
                        {liveCountyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `KES ${v.toFixed(2)}B`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* County Table */}
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold">County Distribution (Live)</h3>
                <button
                  onClick={() => generateCSV(liveCountyData.map(c => ({
                    County: c.county,
                    Bills: c.bills,
                    'Amount (B)': c.amount.toFixed(2),
                    '% of Total': ((c.bills / liveStats.totalBills) * 100).toFixed(1),
                  })), 'county_distribution')}
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
                      <th className="px-4 py-3 text-left bg-muted/30">County</th>
                      <th className="px-4 py-3 text-right bg-muted/30">Bills</th>
                      <th className="px-4 py-3 text-right bg-muted/30">Amount (B)</th>
                      <th className="px-4 py-3 text-right bg-muted/30">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveCountyData.map((row) => (
                      <tr key={row.county} className="border-b border-border/50">
                        <td className="px-4 py-3 font-medium">{row.county}</td>
                        <td className="px-4 py-3 text-right font-mono">{row.bills.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono">KES {row.amount.toFixed(2)}B</td>
                        <td className="px-4 py-3 text-right font-mono">
                          {liveStats.totalBills > 0 ? ((row.bills / liveStats.totalBills) * 100).toFixed(1) : 0}%
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
