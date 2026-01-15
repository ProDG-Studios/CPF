import { FileText, DollarSign, CheckCircle, TrendingUp, Clock, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";
import KPICard from "@/components/dashboard/KPICard";
import StatusBreakdown from "@/components/dashboard/StatusBreakdown";
import TrendChart from "@/components/dashboard/TrendChart";
import TopMDAs from "@/components/dashboard/TopMDAs";
import RecentActivity from "@/components/dashboard/RecentActivity";
import CategoryChart from "@/components/dashboard/CategoryChart";
import { totalStats } from "@/data/mockData";
import { useFilters } from "@/contexts/FilterContext";

const Index = () => {
  const navigate = useNavigate();
  const { toggleArrayFilter } = useFilters();

  const handleKPIClick = (status?: string) => {
    if (status) toggleArrayFilter('status', status);
    navigate('/bills');
  };

  return (
    <div className="min-h-screen">
      <TopBar title="Dashboard" subtitle="Pending Bills Securitization Overview" />
      
      <div className="p-6 space-y-6">
        {/* Hero */}
        <div className="glass-card p-5 bg-primary text-primary-foreground border-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/15 rounded text-xs font-medium mb-2">
                <Clock className="w-3.5 h-3.5" />
                Phase 1: Fast-Track Settlement
              </div>
              <h1 className="text-xl font-semibold mb-1">CPF Pending Bills Securitization</h1>
              <p className="text-sm text-primary-foreground/75 max-w-lg">
                Settlement vehicle for verified government bills up to KES 2M.
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/workflow')}
                className="px-4 py-2 bg-white text-primary rounded-md text-sm font-medium hover:bg-white/90 transition-colors"
              >
                View Workflow
              </button>
              <button 
                onClick={() => navigate('/bills')}
                className="px-4 py-2 bg-white/15 text-white rounded-md text-sm font-medium hover:bg-white/25 transition-colors"
              >
                Explore Bills
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard
            title="Total Bills"
            value={totalStats.totalBills.toLocaleString()}
            subtitle="All pending"
            icon={FileText}
            variant="default"
            onClick={() => handleKPIClick()}
            isClickable
          />
          <KPICard
            title="Total Value"
            value={`KES ${totalStats.totalAmountBillion}B`}
            subtitle="Outstanding"
            icon={DollarSign}
            variant="accent"
            onClick={() => handleKPIClick()}
            isClickable
          />
          <KPICard
            title="Verified"
            value={totalStats.verifiedBills.toLocaleString()}
            subtitle={`KES ${totalStats.verifiedAmountBillion}B`}
            icon={CheckCircle}
            variant="success"
            trend={{ value: 12, isPositive: true }}
            onClick={() => handleKPIClick('verified')}
            isClickable
          />
          <KPICard
            title="Processing"
            value={totalStats.processingBills.toLocaleString()}
            subtitle={`KES ${totalStats.processingAmountBillion}B`}
            icon={Clock}
            variant="warning"
            onClick={() => handleKPIClick('processing')}
            isClickable
          />
          <KPICard
            title="Paid Out"
            value={totalStats.paidBills.toLocaleString()}
            subtitle={`KES ${totalStats.paidAmountBillion}B`}
            icon={TrendingUp}
            variant="default"
            trend={{ value: 8, isPositive: true }}
            onClick={() => handleKPIClick('paid')}
            isClickable
          />
          <KPICard
            title="Eligible (≤2M)"
            value={totalStats.eligibleBills.toLocaleString()}
            subtitle={`KES ${totalStats.eligibleAmountBillion}B`}
            icon={Users}
            variant="accent"
            onClick={() => handleKPIClick()}
            isClickable
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TrendChart />
          </div>
          <StatusBreakdown />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TopMDAs />
          <div className="lg:col-span-2">
            <CategoryChart />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          
          {/* Progress Card */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Phase 1 Progress</h3>
              <button 
                onClick={() => navigate('/workflow')}
                className="text-xs text-accent font-medium flex items-center gap-1 hover:underline"
              >
                Details <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Verification', value: 54.7 },
                { label: 'Disbursement', value: 17.9 },
                { label: 'MDA Coverage', value: 75 },
                { label: 'Transaction Steps', value: 44.4 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-xs font-medium text-foreground">{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 p-3 bg-success/10 rounded-md">
              <p className="text-xs text-success font-medium">✓ On track for Phase 1 completion</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
