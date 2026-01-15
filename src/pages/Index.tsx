import { FileText, DollarSign, CheckCircle, TrendingUp, Clock, Users } from "lucide-react";
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
    if (status) {
      toggleArrayFilter('status', status);
    }
    navigate('/bills');
  };

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Dashboard" 
        subtitle="Pending Bills Securitization Overview"
      />
      
      <div className="p-6">
        {/* Hero Banner */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-medium mb-3">
                <Clock className="w-4 h-4" />
                Phase 1: Fast-Track Settlement Active
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                CPF Pending Bills Securitization
              </h1>
              <p className="text-muted-foreground max-w-xl">
                Settlement vehicle for verified government bills up to <span className="text-accent font-semibold">KES 2M</span>. 
                Track verification progress and transaction flow in real-time.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/workflow')}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium transition-colors"
              >
                View Workflow
              </button>
              <button 
                onClick={() => navigate('/bills')}
                className="px-5 py-2.5 bg-muted border border-border text-foreground rounded-lg font-medium transition-colors"
              >
                Explore Bills
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <KPICard
            title="Total Bills"
            value={totalStats.totalBills.toLocaleString()}
            subtitle="All pending bills"
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
            variant="secondary"
            trend={{ value: 8, isPositive: true }}
            onClick={() => handleKPIClick('paid')}
            isClickable
          />
          <KPICard
            title="Eligible (≤2M)"
            value={totalStats.eligibleBills.toLocaleString()}
            subtitle={`KES ${totalStats.eligibleAmountBillion}B`}
            icon={Users}
            variant="default"
            onClick={() => handleKPIClick()}
            isClickable
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <TrendChart />
          </div>
          <StatusBreakdown />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <TopMDAs />
          <div className="lg:col-span-2">
            <CategoryChart />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          
          {/* Quick Stats Summary */}
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">
              Phase 1 Progress
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Verification Progress</span>
                  <span className="text-sm font-semibold text-foreground">54.7%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: '54.7%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Payment Disbursement</span>
                  <span className="text-sm font-semibold text-foreground">17.9%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '17.9%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">MDA Coverage</span>
                  <span className="text-sm font-semibold text-foreground">75%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Transaction Steps</span>
                  <span className="text-sm font-semibold text-foreground">4/9</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '44.4%' }} />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-success/10 border border-success/30 rounded-lg">
              <p className="text-sm text-success font-medium">
                ✓ On track for Phase 1 completion by Q1 2024
              </p>
              <p className="text-xs text-success/70 mt-1">
                25,366 bills eligible for fast-track settlement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
