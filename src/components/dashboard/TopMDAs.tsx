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

  const handleMDAClick = (mdaId: string) => {
    toggleArrayFilter('mdaIds', mdaId);
    navigate('/bills');
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Top MDAs</h3>
          <p className="text-xs text-muted-foreground">By total value</p>
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
          const verifiedPct = (mda.verifiedAmount / mda.totalAmount) * 100;
          
          return (
            <button
              key={mda.id}
              onClick={() => handleMDAClick(mda.id)}
              className="w-full text-left p-2.5 rounded-md hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-foreground flex-1 truncate">{mda.shortName}</span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(mda.totalAmount, true)}</span>
              </div>
              <div className="flex items-center gap-2 pl-8">
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${verifiedPct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">{verifiedPct.toFixed(0)}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TopMDAs;
