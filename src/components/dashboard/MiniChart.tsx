import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface MiniChartProps {
  data: { value: number }[];
  color?: string;
  height?: number;
}

const MiniChart = ({ data, color = "hsl(217, 91%, 45%)", height = 60 }: MiniChartProps) => {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${color.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(222, 47%, 11%)',
              border: '1px solid hsl(217, 33%, 20%)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color.replace(/[^a-zA-Z0-9]/g, '')})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MiniChart;
