import { useNavigate } from 'react-router-dom';
import { useFilters } from '@/contexts/FilterContext';
import { mdaData, formatCurrency } from '@/data/mockData';
import { ArrowRight } from 'lucide-react';

const TopMDAs = () => {
  const navigate = useNavigate();
  const { toggleArrayFilter } = useFilters();
  
  const topMDAs = [...mdaData]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5);

  const maxAmount = topMDAs[0]?.totalAmount || 1;

  const handleMDAClick = (mdaId: string) => {
    toggleArrayFilter('mdaIds', mdaId);
    navigate('/bills');
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Top MDAs by Value</h3>
          <p className="text-xs text-muted-foreground">Click to filter bills</p>
        </div>
        <button 
          onClick={() => navigate('/mdas')}
          className="text-xs text-accent font-medium flex items-center gap-1 hover:underline"
        >
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {topMDAs.map((mda, index) => {
          const percentage = (mda.totalAmount / maxAmount) * 100;
          const verifiedPercentage = (mda.verifiedAmount / mda.totalAmount) * 100;
          
          return (
            <button
              key={mda.id}
              onClick={() => handleMDAClick(mda.id)}
              className="w-full text-left p-2.5 rounded hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                    {mda.shortName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(mda.totalAmount, true)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-success rounded-full"
                    style={{ width: `${verifiedPercentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {verifiedPercentage.toFixed(0)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TopMDAs;
