import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '@/contexts/FilterContext';
import { useData } from '@/contexts/DataContext';
import { Download } from 'lucide-react';
import { generateCSV } from '@/lib/exportUtils';

const StatusBreakdown = () => {
  const navigate = useNavigate();
  const { toggleArrayFilter } = useFilters();
  const { bills } = useData();

  // Calculate live stats from bills
  const stats = {
    verified: bills.filter(b => b.status === 'verified').length,
    processing: bills.filter(b => b.status === 'processing').length,
    pending: bills.filter(b => b.status === 'pending').length,
    paid: bills.filter(b => b.status === 'paid').length,
    rejected: bills.filter(b => b.status === 'rejected').length,
  };

  const data = [
    { name: 'Verified', value: stats.verified, color: 'hsl(160, 50%, 40%)', status: 'verified' },
    { name: 'Processing', value: stats.processing, color: 'hsl(220, 10%, 50%)', status: 'processing' },
    { name: 'Pending', value: stats.pending, color: 'hsl(40, 85%, 55%)', status: 'pending' },
    { name: 'Paid', value: stats.paid, color: 'hsl(220, 25%, 12%)', status: 'paid' },
  ].filter(d => d.value > 0);

  const handleClick = (status: string) => {
    toggleArrayFilter('status', status);
    navigate('/bills');
  };

  const handleExport = () => {
    generateCSV(
      data.map(d => ({ Status: d.name, Count: d.value, Percentage: ((d.value / bills.length) * 100).toFixed(1) + '%' })),
      'status_breakdown'
    );
  };

  return (
    <div className="glass-card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Bills by Status</h3>
        <button
          onClick={handleExport}
          className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          title="Export to CSV"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={2}
              dataKey="value"
              onClick={(entry) => handleClick(entry.status)}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 15%, 88%)',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Bills']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        {data.map((item) => (
          <button
            key={item.name}
            onClick={() => handleClick(item.status)}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary transition-colors text-left"
          >
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <div>
              <p className="text-xs font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.value.toLocaleString()}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusBreakdown;
