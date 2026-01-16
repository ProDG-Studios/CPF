import { FileText, DollarSign, CheckCircle, TrendingUp, Clock, Users, ArrowRight, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";
import KPICard from "@/components/dashboard/KPICard";
import StatusBreakdown from "@/components/dashboard/StatusBreakdown";
import TrendChart from "@/components/dashboard/TrendChart";
import TopMDAs from "@/components/dashboard/TopMDAs";
import RecentActivity from "@/components/dashboard/RecentActivity";
import CategoryChart from "@/components/dashboard/CategoryChart";
import { useFilters } from "@/contexts/FilterContext";
import { useData } from "@/contexts/DataContext";
import { formatCurrency } from "@/data/mockData";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { toggleArrayFilter } = useFilters();
  const { getStats, transactionSteps, activityLog, resetData } = useData();

  const stats = getStats();
  const completedSteps = transactionSteps.filter(s => s.status === 'completed').length;
  const workflowProgress = (completedSteps / transactionSteps.length) * 100;

  const handleKPIClick = (status?: string) => {
    if (status) toggleArrayFilter('status', status);
    navigate('/bills');
  };

  const handleReset = () => {
    resetData();
    toast.info('All data has been reset to initial state');
  };

  return (
    <div className="min-h-screen">
      <TopBar title="Dashboard" subtitle="Pending Bills Securitization Overview" />
      
      <div className="p-6 space-y-6">
        {/* Hero */}
        <div className="glass-card p-5 border-l-2 border-l-accent">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-secondary rounded text-xs font-medium text-muted-foreground mb-2">
                <Clock className="w-3.5 h-3.5" />
                Phase 1: Fast-Track Settlement
              </div>
              <h1 className="text-xl font-semibold text-foreground mb-1">CPF Pending Bills Securitization</h1>
              <p className="text-sm text-muted-foreground max-w-lg">
                Settlement vehicle for verified government bills up to KES 2M. All actions sync across the platform.
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/workflow')}
                className="px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:opacity-90 transition-colors"
              >
                View Workflow
              </button>
              <button 
                onClick={() => navigate('/bills')}
                className="px-4 py-2 bg-secondary border border-border text-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Explore Bills
              </button>
              <button 
                onClick={handleReset}
                className="px-3 py-2 bg-muted text-muted-foreground rounded-md text-sm font-medium hover:bg-muted/80 transition-colors"
                title="Reset all data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* KPIs - Now using live data */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard
            title="Total Bills"
            value={stats.totalBills.toLocaleString()}
            subtitle={formatCurrency(stats.totalAmount, true)}
            icon={FileText}
            variant="default"
            onClick={() => handleKPIClick()}
            isClickable
          />
          <KPICard
            title="Verified"
            value={stats.verifiedBills.toLocaleString()}
            subtitle={formatCurrency(stats.verifiedAmount, true)}
            icon={CheckCircle}
            variant="success"
            onClick={() => handleKPIClick('verified')}
            isClickable
          />
          <KPICard
            title="Processing"
            value={stats.processingBills.toLocaleString()}
            subtitle={formatCurrency(stats.processingAmount, true)}
            icon={Clock}
            variant="warning"
            onClick={() => handleKPIClick('processing')}
            isClickable
          />
          <KPICard
            title="Pending"
            value={stats.pendingBills.toLocaleString()}
            subtitle={formatCurrency(stats.pendingAmount, true)}
            icon={Users}
            variant="default"
            onClick={() => handleKPIClick('pending')}
            isClickable
          />
          <KPICard
            title="Paid Out"
            value={stats.paidBills.toLocaleString()}
            subtitle={formatCurrency(stats.paidAmount, true)}
            icon={DollarSign}
            variant="accent"
            onClick={() => handleKPIClick('paid')}
            isClickable
          />
          <KPICard
            title="Workflow"
            value={`${workflowProgress.toFixed(0)}%`}
            subtitle={`${completedSteps}/${transactionSteps.length} steps`}
            icon={TrendingUp}
            variant="default"
            onClick={() => navigate('/workflow')}
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
          
          {/* Progress Card - Now using live data */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Phase 1 Progress</h3>
              <button 
                onClick={() => navigate('/workflow')}
                className="text-xs text-muted-foreground font-medium flex items-center gap-1 hover:text-foreground"
              >
                Details <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Bill Verification', value: stats.totalBills > 0 ? (stats.verifiedBills / stats.totalBills) * 100 : 0 },
                { label: 'Payments Disbursed', value: stats.verifiedBills > 0 ? (stats.paidBills / stats.verifiedBills) * 100 : 0 },
                { label: 'Workflow Progress', value: workflowProgress },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-xs font-medium text-foreground">{item.value.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {activityLog.length > 0 && (
              <div className="mt-5 p-3 bg-success/10 rounded-md">
                <p className="text-xs text-success font-medium">✓ {activityLog.length} actions recorded this session</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
