import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '@/contexts/FilterContext';

const data = [
  { name: 'Verified', value: 15420, color: 'hsl(160, 50%, 40%)', status: 'verified' },
  { name: 'Processing', value: 4200, color: 'hsl(180, 45%, 40%)', status: 'processing' },
  { name: 'Pending', value: 6170, color: 'hsl(40, 85%, 55%)', status: 'pending' },
  { name: 'Paid', value: 2400, color: 'hsl(220, 20%, 18%)', status: 'paid' },
];

const StatusBreakdown = () => {
  const navigate = useNavigate();
  const { toggleArrayFilter } = useFilters();

  const handleClick = (status: string) => {
    toggleArrayFilter('status', status);
    navigate('/bills');
  };

  return (
    <div className="glass-card p-5 h-full">
      <h3 className="font-semibold text-foreground mb-4">Bills by Status</h3>
      
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
