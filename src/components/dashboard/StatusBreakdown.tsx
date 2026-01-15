import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '@/contexts/FilterContext';

const data = [
  { name: 'Verified', value: 15420, color: 'hsl(142, 76%, 36%)', status: 'verified' },
  { name: 'Processing', value: 4200, color: 'hsl(217, 91%, 45%)', status: 'processing' },
  { name: 'Pending', value: 6170, color: 'hsl(38, 92%, 50%)', status: 'pending' },
  { name: 'Paid', value: 2400, color: 'hsl(173, 58%, 39%)', status: 'paid' },
];

const StatusBreakdown = () => {
  const navigate = useNavigate();
  const { toggleArrayFilter } = useFilters();

  const handleClick = (status: string) => {
    toggleArrayFilter('status', status);
    navigate('/bills');
  };

  return (
    <div className="glass-card p-6 h-full">
      <h3 className="font-display text-lg font-bold text-foreground mb-4">
        Bills by Status
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
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
                backgroundColor: 'hsl(222, 47%, 11%)',
                border: '1px solid hsl(217, 33%, 20%)',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Bills']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item) => (
          <button
            key={item.name}
            onClick={() => handleClick(item.status)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <div>
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.value.toLocaleString()}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusBreakdown;
