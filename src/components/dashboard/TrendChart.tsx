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
import { useState } from 'react';
import { cn } from '@/lib/utils';

const TrendChart = () => {
  const [activePeriod, setActivePeriod] = useState('1Y');

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Verification Trends</h3>
          <p className="text-xs text-muted-foreground">Monthly progress</p>
        </div>
        <div className="flex gap-1">
          {['6M', '1Y', 'All'].map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                activePeriod === period 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="hsl(220, 10%, 50%)"
              tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(220, 10%, 50%)"
              tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 11 }}
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
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            <Area
              type="monotone"
              dataKey="verified"
              name="Verified"
              stroke="hsl(160, 50%, 40%)"
              strokeWidth={2}
              fill="hsl(160, 50%, 40%)"
              fillOpacity={0.1}
            />
            <Area
              type="monotone"
              dataKey="pending"
              name="Pending"
              stroke="hsl(40, 85%, 55%)"
              strokeWidth={2}
              fill="hsl(40, 85%, 55%)"
              fillOpacity={0.1}
            />
            <Area
              type="monotone"
              dataKey="paid"
              name="Paid"
              stroke="hsl(220, 20%, 18%)"
              strokeWidth={2}
              fill="hsl(220, 20%, 18%)"
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
