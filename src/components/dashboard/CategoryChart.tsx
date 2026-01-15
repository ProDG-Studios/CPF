import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { categoryBreakdown } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '@/contexts/FilterContext';

const CategoryChart = () => {
  const navigate = useNavigate();
  const { toggleArrayFilter } = useFilters();

  const handleClick = (category: string) => {
    toggleArrayFilter('categories', category);
    navigate('/bills');
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Bills by Category</h3>
          <p className="text-xs text-muted-foreground">Click to filter</p>
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
              fill="hsl(180, 45%, 40%)"
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
