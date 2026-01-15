import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '@/contexts/FilterContext';

const data = [
  { name: 'Verified', value: 15420, color: 'hsl(152, 70%, 35%)', status: 'verified' },
  { name: 'Processing', value: 4200, color: 'hsl(210, 100%, 45%)', status: 'processing' },
  { name: 'Pending', value: 6170, color: 'hsl(38, 95%, 50%)', status: 'pending' },
  { name: 'Paid', value: 2400, color: 'hsl(220, 60%, 15%)', status: 'paid' },
];

const StatusBreakdown = () => {
  const navigate = useNavigate();
  const { toggleArrayFilter } = useFilters();

  const handleClick = (status: string) => {
    toggleArrayFilter('status', status);
    navigate('/bills');
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="glass-card p-5 h-full">
      <h3 className="font-semibold text-foreground mb-4">Bills by Status</h3>
      
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              onClick={(entry) => handleClick(entry.status)}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 14%, 90%)',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Bills']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        {data.map((item) => (
          <button
            key={item.name}
            onClick={() => handleClick(item.status)}
            className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors text-left"
          >
            <div 
              className="w-2.5 h-2.5 rounded-full shrink-0" 
              style={{ backgroundColor: item.color }}
            />
            <div className="min-w-0">
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
