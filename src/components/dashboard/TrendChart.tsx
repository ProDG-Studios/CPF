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
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Verification Trends
          </h3>
          <p className="text-sm text-muted-foreground">Monthly progress over time</p>
        </div>
        <div className="flex gap-2">
          {['6M', '1Y', 'All'].map((period) => (
            <button
              key={period}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(0, 0%, 45%)"
              tick={{ fill: 'hsl(0, 0%, 45%)', fontSize: 12 }}
            />
            <YAxis 
              stroke="hsl(0, 0%, 45%)"
              tick={{ fill: 'hsl(0, 0%, 45%)', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(0, 0%, 90%)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="verified"
              name="Verified"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
              fill="hsl(142, 76%, 36%)"
              fillOpacity={0.15}
            />
            <Area
              type="monotone"
              dataKey="pending"
              name="Pending"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              fill="hsl(38, 92%, 50%)"
              fillOpacity={0.15}
            />
            <Area
              type="monotone"
              dataKey="paid"
              name="Paid"
              stroke="hsl(173, 58%, 39%)"
              strokeWidth={2}
              fill="hsl(173, 58%, 39%)"
              fillOpacity={0.15}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
