import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '@/contexts/FilterContext';
import { useData } from '@/contexts/DataContext';
import { useMemo } from 'react';
import { Download, Printer } from 'lucide-react';
import { generateCSV, generatePrintableReport } from '@/lib/exportUtils';

const CategoryChart = () => {
  const navigate = useNavigate();
  const { toggleArrayFilter } = useFilters();
  const { bills } = useData();

  // Calculate live category breakdown from bills
  const categoryBreakdown = useMemo(() => {
    const categoryMap = new Map<string, { bills: number; amount: number }>();
    
    bills.forEach(bill => {
      const existing = categoryMap.get(bill.category) || { bills: 0, amount: 0 };
      categoryMap.set(bill.category, {
        bills: existing.bills + 1,
        amount: existing.amount + bill.amount,
      });
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        bills: data.bills,
        amount: parseFloat((data.amount / 1000000000).toFixed(2)), // Convert to billions
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 7);
  }, [bills]);

  const handleClick = (category: string) => {
    toggleArrayFilter('categories', category);
    navigate('/bills');
  };

  const handleExport = () => {
    generateCSV(
      categoryBreakdown.map(c => ({
        Category: c.category,
        'Number of Bills': c.bills,
        'Amount (KES Billions)': c.amount,
      })),
      'category_breakdown'
    );
  };

  const handlePrint = () => {
    const totalAmount = categoryBreakdown.reduce((sum, c) => sum + c.amount, 0);
    const content = `
      <h3>Bills by Category</h3>
      <div style="margin-bottom: 20px;">
        <div class="stat"><div class="stat-value">${categoryBreakdown.length}</div><div class="stat-label">Categories</div></div>
        <div class="stat"><div class="stat-value">KES ${totalAmount.toFixed(1)}B</div><div class="stat-label">Total Value</div></div>
      </div>
      <table>
        <thead>
          <tr><th>Category</th><th>Bills</th><th>Amount (B)</th><th>% of Total</th></tr>
        </thead>
        <tbody>
          ${categoryBreakdown.map(c => `
            <tr>
              <td>${c.category}</td>
              <td>${c.bills}</td>
              <td>KES ${c.amount}B</td>
              <td>${((c.amount / totalAmount) * 100).toFixed(1)}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    generatePrintableReport('Category Breakdown Report', content);
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Bills by Category</h3>
          <p className="text-xs text-muted-foreground">Click to filter (live data)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={categoryBreakdown} 
            layout="vertical"
            margin={{ left: 80, right: 15 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" horizontal={true} vertical={false} />
            <XAxis 
              type="number"
              stroke="hsl(220, 10%, 50%)"
              tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 11 }}
              tickFormatter={(value) => `${value}B`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="category"
              dataKey="category"
              stroke="hsl(220, 10%, 50%)"
              tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 11 }}
              width={80}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 15%, 88%)',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`KES ${value}B`, 'Amount']}
            />
            <Bar 
              dataKey="amount" 
              fill="hsl(220, 10%, 50%)"
              radius={[0, 3, 3, 0]}
              className="cursor-pointer"
              onClick={(data) => handleClick(data.category)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryChart;
