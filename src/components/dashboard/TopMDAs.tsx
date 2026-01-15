import { useNavigate } from 'react-router-dom';
import { useFilters } from '@/contexts/FilterContext';
import { mdaData, formatCurrency } from '@/data/mockData';
import { ArrowRight, Building2 } from 'lucide-react';

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
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Top MDAs by Value
          </h3>
          <p className="text-sm text-muted-foreground">Click to filter bills</p>
        </div>
        <button 
          onClick={() => navigate('/mdas')}
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
        >
          View all <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {topMDAs.map((mda, index) => {
          const percentage = (mda.totalAmount / maxAmount) * 100;
          const verifiedPercentage = (mda.verifiedAmount / mda.totalAmount) * 100;
          
          return (
            <button
              key={mda.id}
              onClick={() => handleMDAClick(mda.id)}
              className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {mda.shortName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{mda.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-accent">{formatCurrency(mda.totalAmount, true)}</p>
                  <p className="text-xs text-muted-foreground">{mda.totalBills.toLocaleString()} bills</p>
                </div>
              </div>
              
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-success/50 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
                <div 
                  className="absolute inset-y-0 left-0 bg-success rounded-full"
                  style={{ width: `${(verifiedPercentage / 100) * percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {verifiedPercentage.toFixed(0)}% verified
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TopMDAs;
