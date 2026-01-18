import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import TopBar from "@/components/layout/TopBar";
import IdentityCard from "@/components/identity/IdentityCard";
import { 
  FileText, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Users, 
  Building2, 
  Briefcase, 
  Landmark,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface DashboardStats {
  totalBills: number;
  totalAmount: number;
  submittedBills: number;
  offeredBills: number;
  approvedBills: number;
  certifiedBills: number;
  totalSuppliers: number;
  totalSPVs: number;
  totalMDAs: number;
  totalTreasury: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBills: 0,
    totalAmount: 0,
    submittedBills: 0,
    offeredBills: 0,
    approvedBills: 0,
    certifiedBills: 0,
    totalSuppliers: 0,
    totalSPVs: 0,
    totalMDAs: 0,
    totalTreasury: 0,
  });
  const [recentBills, setRecentBills] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch bills statistics
      const { data: bills, error: billsError } = await supabase
        .from('bills')
        .select('*');
      
      if (billsError) throw billsError;

      // Calculate stats from bills
      const totalAmount = bills?.reduce((sum, bill) => sum + Number(bill.amount || 0), 0) || 0;
      const submittedBills = bills?.filter(b => b.status === 'submitted' || b.status === 'under_review').length || 0;
      const offeredBills = bills?.filter(b => b.status === 'offer_made' || b.status === 'offer_accepted').length || 0;
      const approvedBills = bills?.filter(b => b.status === 'mda_approved' || b.status === 'terms_set' || b.status === 'agreement_sent').length || 0;
      const certifiedBills = bills?.filter(b => b.status === 'certified').length || 0;

      // Fetch user counts by role
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role');
      
      if (rolesError) throw rolesError;

      const supplierCount = userRoles?.filter(r => r.role === 'supplier').length || 0;
      const spvCount = userRoles?.filter(r => r.role === 'spv').length || 0;
      const mdaCount = userRoles?.filter(r => r.role === 'mda').length || 0;
      const treasuryCount = userRoles?.filter(r => r.role === 'treasury').length || 0;

      setStats({
        totalBills: bills?.length || 0,
        totalAmount,
        submittedBills,
        offeredBills,
        approvedBills,
        certifiedBills,
        totalSuppliers: supplierCount,
        totalSPVs: spvCount,
        totalMDAs: mdaCount,
        totalTreasury: treasuryCount,
      });

      // Fetch recent bills
      const { data: recent } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentBills(recent || []);

      // Fetch recent activity
      const { data: activity } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setRecentActivity(activity || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'spv_offered': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'offer_accepted': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'mda_approved': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'treasury_certified': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const workflowProgress = stats.totalBills > 0 
    ? ((stats.certifiedBills / stats.totalBills) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Admin Dashboard" subtitle="System-wide overview and management" />
      
      <div className="p-6 space-y-6">
        {/* Admin Identity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <IdentityCard variant="full" />
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Admin Access</h3>
                <p className="text-xs text-muted-foreground">Full system privileges</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">View all bills</span>
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Manage users</span>
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">System analytics</span>
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
            </div>
          </div>
        </div>

        {/* User Statistics */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Platform Users</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/admin/suppliers')}
              className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalSuppliers}</p>
                  <p className="text-xs text-muted-foreground">Suppliers</p>
                </div>
              </div>
            </button>

            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40">
                  <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalSPVs}</p>
                  <p className="text-xs text-muted-foreground">SPVs</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/admin/mdas')}
              className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                  <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.totalMDAs}</p>
                  <p className="text-xs text-muted-foreground">MDA Users</p>
                </div>
              </div>
            </button>

            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                  <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.totalTreasury}</p>
                  <p className="text-xs text-muted-foreground">Treasury</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bill Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalBills}</p>
            <p className="text-xs text-muted-foreground">Total Bills</p>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">{formatCurrency(stats.totalAmount)}</p>
            <p className="text-xs text-muted-foreground">Total Value</p>
          </div>

          <div className="glass-card p-4 border-l-4 border-l-blue-500">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.submittedBills}</p>
            <p className="text-xs text-muted-foreground">Submitted</p>
          </div>

          <div className="glass-card p-4 border-l-4 border-l-purple-500">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.offeredBills}</p>
            <p className="text-xs text-muted-foreground">SPV Offered</p>
          </div>

          <div className="glass-card p-4 border-l-4 border-l-amber-500">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.approvedBills}</p>
            <p className="text-xs text-muted-foreground">MDA Approved</p>
          </div>

          <div className="glass-card p-4 border-l-4 border-l-emerald-500">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.certifiedBills}</p>
            <p className="text-xs text-muted-foreground">Certified</p>
          </div>
        </div>

        {/* Workflow Progress */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Securitization Pipeline</h3>
              <p className="text-xs text-muted-foreground">Bills progression through workflow stages</p>
            </div>
            <button 
              onClick={() => navigate('/admin/workflow')}
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              View Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Submitted', count: stats.submittedBills, icon: FileText, color: 'bg-blue-500' },
              { label: 'SPV Offered', count: stats.offeredBills, icon: Briefcase, color: 'bg-purple-500' },
              { label: 'MDA Approved', count: stats.approvedBills, icon: Building2, color: 'bg-amber-500' },
              { label: 'Certified', count: stats.certifiedBills, icon: CheckCircle, color: 'bg-emerald-500' },
            ].map((stage, index) => (
              <div key={stage.label} className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white", stage.color)}>
                    <stage.icon className="w-4 h-4" />
                  </div>
                  {index < 3 && (
                    <div className="flex-1 h-1 bg-muted rounded">
                      <div 
                        className={cn("h-full rounded", stage.color)}
                        style={{ width: stats.totalBills > 0 ? `${(stage.count / stats.totalBills) * 100}%` : '0%' }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium">{stage.count}</p>
                <p className="text-xs text-muted-foreground">{stage.label}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall Completion</span>
              <span className="font-medium">{workflowProgress.toFixed(1)}%</span>
            </div>
            <Progress value={workflowProgress} className="h-2" />
          </div>
        </div>

        {/* Recent Bills & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bills */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Recent Bills</h3>
              <button 
                onClick={() => navigate('/admin/bills')}
                className="text-sm text-accent hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-border">
              {recentBills.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No bills submitted yet</p>
                </div>
              ) : (
                recentBills.map((bill) => (
                  <div key={bill.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{bill.invoice_number}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {bill.description || 'No description'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatCurrency(Number(bill.amount))}</p>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", getStatusColor(bill.status))}>
                          {bill.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Recent Activity</h3>
            </div>
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No activity recorded yet</p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/bills')}
              className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left"
            >
              <FileText className="w-5 h-5 text-accent mb-2" />
              <p className="font-medium text-sm">Explore Bills</p>
              <p className="text-xs text-muted-foreground">View all system bills</p>
            </button>

            <button
              onClick={() => navigate('/admin/workflow')}
              className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left"
            >
              <TrendingUp className="w-5 h-5 text-accent mb-2" />
              <p className="font-medium text-sm">Workflow Status</p>
              <p className="text-xs text-muted-foreground">Track transaction flow</p>
            </button>

            <button
              onClick={() => navigate('/admin/analytics')}
              className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left"
            >
              <DollarSign className="w-5 h-5 text-accent mb-2" />
              <p className="font-medium text-sm">Analytics</p>
              <p className="text-xs text-muted-foreground">Platform insights</p>
            </button>

            <button
              onClick={() => navigate('/admin/suppliers')}
              className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left"
            >
              <Users className="w-5 h-5 text-accent mb-2" />
              <p className="font-medium text-sm">Manage Users</p>
              <p className="text-xs text-muted-foreground">View all users</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
