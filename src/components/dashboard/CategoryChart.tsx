import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { categoryBreakdown } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '@/contexts/FilterContext';

const colors = [
  'hsl(220, 60%, 15%)',
  'hsl(210, 100%, 45%)',
  'hsl(152, 70%, 35%)',
  'hsl(38, 95%, 50%)',
  'hsl(0, 84%, 50%)',
  'hsl(280, 60%, 45%)',
  'hsl(180, 60%, 35%)',
];

const CategoryChart = () => {
  const navigate = useNavigate();
  const { toggleArrayFilter } = useFilters();

  const handleClick = (category: string) => {
    toggleArrayFilter('categories', category);
    navigate('/bills');
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-foreground">Bills by Category</h3>
          <p className="text-xs text-muted-foreground">Click bars to filter</p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={categoryBreakdown} 
            layout="vertical"
            margin={{ left: 90, right: 15 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 90%)" horizontal={true} vertical={false} />
            <XAxis 
              type="number"
              stroke="hsl(220, 10%, 45%)"
              tick={{ fill: 'hsl(220, 10%, 45%)', fontSize: 11 }}
              tickFormatter={(value) => `${value}B`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="category"
              dataKey="category"
              stroke="hsl(220, 10%, 45%)"
              tick={{ fill: 'hsl(220, 10%, 45%)', fontSize: 11 }}
              width={90}
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
              formatter={(value: number) => [`KES ${value}B`, 'Amount']}
            />
            <Bar 
              dataKey="amount" 
              radius={[0, 3, 3, 0]}
              className="cursor-pointer"
              onClick={(data) => handleClick(data.category)}
            >
              {categoryBreakdown.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryChart;
