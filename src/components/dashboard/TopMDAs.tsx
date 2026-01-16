import { useNavigate } from 'react-router-dom';
import { useFilters } from '@/contexts/FilterContext';
import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/data/mockData';
import { ArrowRight, Download } from 'lucide-react';
import { generateCSV } from '@/lib/exportUtils';

const TopMDAs = () => {
  const navigate = useNavigate();
  const { toggleArrayFilter } = useFilters();
  const { bills, mdas } = useData();
  
  // Calculate live MDA stats from bills
  const mdaStats = mdas.map(mda => {
    const mdaBills = bills.filter(b => b.mdaId === mda.id);
    const totalAmount = mdaBills.reduce((sum, b) => sum + b.amount, 0);
    const verifiedAmount = mdaBills.filter(b => b.status === 'verified' || b.status === 'paid').reduce((sum, b) => sum + b.amount, 0);
    return {
      ...mda,
      liveTotalAmount: totalAmount,
      liveVerifiedAmount: verifiedAmount,
      liveBillCount: mdaBills.length,
    };
  }).filter(m => m.liveTotalAmount > 0);

  const topMDAs = [...mdaStats]
    .sort((a, b) => b.liveTotalAmount - a.liveTotalAmount)
    .slice(0, 5);

  const handleMDAClick = (mdaId: string) => {
    toggleArrayFilter('mdaIds', mdaId);
    navigate('/bills');
  };

  const handleExport = () => {
    generateCSV(
      topMDAs.map(m => ({
        MDA: m.shortName,
        'Full Name': m.name,
        'Total Bills': m.liveBillCount,
        'Total Amount': m.liveTotalAmount,
        'Verified Amount': m.liveVerifiedAmount,
        'Verified %': ((m.liveVerifiedAmount / m.liveTotalAmount) * 100).toFixed(1) + '%',
      })),
      'top_mdas'
    );
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Top MDAs</h3>
          <p className="text-xs text-muted-foreground">By total value (live)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={() => navigate('/mdas')}
            className="text-xs text-muted-foreground font-medium flex items-center gap-1 hover:text-foreground"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {topMDAs.map((mda, index) => {
          const verifiedPct = mda.liveTotalAmount > 0 ? (mda.liveVerifiedAmount / mda.liveTotalAmount) * 100 : 0;
          
          return (
            <button
              key={mda.id}
              onClick={() => handleMDAClick(mda.id)}
              className="w-full text-left p-2.5 rounded-md hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center text-foreground text-xs font-semibold">
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-foreground flex-1 truncate">{mda.shortName}</span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(mda.liveTotalAmount, true)}</span>
              </div>
              <div className="flex items-center gap-2 pl-8">
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-foreground/20 rounded-full" style={{ width: `${verifiedPct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">{verifiedPct.toFixed(0)}%</span>
              </div>
            </button>
          );
        })}
        
        {topMDAs.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No MDA data available</p>
        )}
      </div>
    </div>
  );
};

export default TopMDAs;
