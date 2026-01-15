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
            <defs>
              <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(215, 20%, 55%)"
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
            />
            <YAxis 
              stroke="hsl(215, 20%, 55%)"
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 11%)',
                border: '1px solid hsl(217, 33%, 20%)',
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
              fillOpacity={1}
              fill="url(#colorVerified)"
            />
            <Area
              type="monotone"
              dataKey="pending"
              name="Pending"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPending)"
            />
            <Area
              type="monotone"
              dataKey="paid"
              name="Paid"
              stroke="hsl(173, 58%, 39%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPaid)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
