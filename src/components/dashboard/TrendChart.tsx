import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { monthlyTrends } from '@/data/mockData';

const TrendChart = () => {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-foreground">Verification Trends</h3>
          <p className="text-xs text-muted-foreground">Monthly progress over time</p>
        </div>
        <div className="flex gap-1">
          {['6M', '1Y', 'All'].map((period, i) => (
            <button
              key={period}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                i === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 90%)" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="hsl(220, 10%, 45%)"
              tick={{ fill: 'hsl(220, 10%, 45%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(220, 10%, 45%)"
              tick={{ fill: 'hsl(220, 10%, 45%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 14%, 90%)',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            />
            <Legend 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Area
              type="monotone"
              dataKey="verified"
              name="Verified"
              stroke="hsl(152, 70%, 35%)"
              strokeWidth={2}
              fill="hsl(152, 70%, 35%)"
              fillOpacity={0.1}
            />
            <Area
              type="monotone"
              dataKey="pending"
              name="Pending"
              stroke="hsl(38, 95%, 50%)"
              strokeWidth={2}
              fill="hsl(38, 95%, 50%)"
              fillOpacity={0.1}
            />
            <Area
              type="monotone"
              dataKey="paid"
              name="Paid"
              stroke="hsl(220, 60%, 15%)"
              strokeWidth={2}
              fill="hsl(220, 60%, 15%)"
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
