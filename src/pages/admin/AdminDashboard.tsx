import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Link2,
  Bell,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  systemMetrics, 
  usersByRole, 
  pipelineData, 
  monthlyTrends,
  topSuppliers,
  topMDAs,
  spvPerformance,
  recentActivity,
  systemAlerts,
  quarterlySummary,
  formatKES 
} from "@/data/adminMockData";
import { format } from "date-fns";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const totalUsers = Object.values(usersByRole).reduce((a, b) => a + b, 0);
  const workflowProgress = (systemMetrics.totalCertifiedCount / systemMetrics.totalBillsCount) * 100;

  return (
    <div className="min-h-screen">
      <TopBar title="Admin Dashboard" subtitle="System-wide oversight and management" />
      
      <div className="p-6 space-y-6">
        {/* Admin Identity & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <div className="glass-card p-5 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20">
                  <Shield className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Admin Control</h3>
                  <p className="text-xs text-muted-foreground">Full System Access</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Status</span>
                  <Badge className="bg-green-100 text-green-700">Operational</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-semibold text-green-600">{systemMetrics.successRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. Processing</span>
                  <span className="font-semibold">{systemMetrics.averageProcessingDays} days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-amber-500" />
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-amber-500">{formatKES(systemMetrics.totalBillsValue)}</p>
              <p className="text-xs text-muted-foreground">Total Bills Value</p>
            </div>

            <div className="glass-card p-4 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-xs text-green-600 font-medium">+12%</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatKES(systemMetrics.totalCertifiedValue)}</p>
              <p className="text-xs text-muted-foreground">Certified Value</p>
            </div>

            <div className="glass-card p-4 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{systemMetrics.totalBillsCount}</p>
              <p className="text-xs text-muted-foreground">Total Bills</p>
            </div>

            <div className="glass-card p-4 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between mb-2">
                <Link2 className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{systemMetrics.activeDeeds}</p>
              <p className="text-xs text-muted-foreground">Blockchain Deeds</p>
            </div>
          </div>
        </div>

        {/* User Distribution */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Platform Users</h3>
              <p className="text-xs text-muted-foreground">{totalUsers} registered users across all roles</p>
            </div>
            <button 
              onClick={() => navigate('/admin/users')}
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              Manage Users <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Suppliers', count: usersByRole.suppliers, icon: Users, color: 'blue', path: '/admin/users?role=supplier' },
              { label: 'SPVs', count: usersByRole.spvs, icon: Briefcase, color: 'purple', path: '/admin/users?role=spv' },
              { label: 'MDAs', count: usersByRole.mdas, icon: Building2, color: 'amber', path: '/admin/users?role=mda' },
              { label: 'Treasury', count: usersByRole.treasury, icon: Landmark, color: 'emerald', path: '/admin/users?role=treasury' },
              { label: 'Admins', count: usersByRole.admins, icon: Shield, color: 'rose', path: '/admin/users?role=admin' },
            ].map((item) => (
              <button 
                key={item.label}
                onClick={() => navigate(item.path)}
                className={cn(
                  "p-4 rounded-lg transition-all hover:scale-105",
                  `bg-${item.color}-50 dark:bg-${item.color}-900/20 hover:bg-${item.color}-100 dark:hover:bg-${item.color}-900/30`
                )}
                style={{ backgroundColor: `var(--${item.color}-50, #f0f9ff)` }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", `bg-${item.color}-100 dark:bg-${item.color}-900/40`)}>
                    <item.icon className={cn("w-5 h-5", `text-${item.color}-600 dark:text-${item.color}-400`)} />
                  </div>
                  <div className="text-left">
                    <p className={cn("text-2xl font-bold", `text-${item.color}-600 dark:text-${item.color}-400`)}>{item.count}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Securitization Pipeline */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Securitization Pipeline</h3>
              <p className="text-xs text-muted-foreground">Bills progression through workflow stages</p>
            </div>
            <button 
              onClick={() => navigate('/admin/bills')}
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              View All Bills <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-6">
            {pipelineData.map((stage, index) => (
              <div key={stage.stage} className="relative">
                <div 
                  className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: `${stage.color}15` }}
                >
                  <p className="text-2xl font-bold" style={{ color: stage.color }}>{stage.count}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{stage.stage}</p>
                  <p className="text-[9px] font-medium" style={{ color: stage.color }}>{formatKES(stage.value)}</p>
                </div>
                {index < pipelineData.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 z-10" />
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall Completion Rate</span>
              <span className="font-medium">{workflowProgress.toFixed(1)}% ({systemMetrics.totalCertifiedCount} of {systemMetrics.totalBillsCount} bills)</span>
            </div>
            <Progress value={workflowProgress} className="h-2" />
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Suppliers */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Top Suppliers
              </h3>
              <button onClick={() => navigate('/admin/users?role=supplier')} className="text-xs text-accent hover:underline">
                View All
              </button>
            </div>
            <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
              {topSuppliers.slice(0, 6).map((supplier, i) => (
                <div key={i} className="p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{supplier.name}</p>
                        <p className="text-xs text-muted-foreground">{supplier.billsCount} bills • {supplier.certified} certified</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-blue-600">{formatKES(supplier.totalValue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top MDAs */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                Top MDAs
              </h3>
              <button onClick={() => navigate('/admin/mdas')} className="text-xs text-accent hover:underline">
                View All
              </button>
            </div>
            <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
              {topMDAs.slice(0, 6).map((mda, i) => (
                <div key={i} className="p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{mda.name}</p>
                        <p className="text-xs text-muted-foreground">{mda.billsCount} bills • {mda.avgProcessingDays}d avg</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-amber-600">{formatKES(mda.totalValue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SPV Performance */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-500" />
                SPV Performance
              </h3>
              <button onClick={() => navigate('/admin/users?role=spv')} className="text-xs text-accent hover:underline">
                View All
              </button>
            </div>
            <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
              {spvPerformance.map((spv, i) => (
                <div key={i} className="p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{spv.name}</p>
                        <p className="text-xs text-muted-foreground">{spv.purchases} purchases • {spv.avgDiscount}% disc</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-purple-600">{formatKES(spv.totalValue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Recent Activity
              </h3>
            </div>
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      activity.type === 'success' && "bg-green-100 dark:bg-green-900/30",
                      activity.type === 'info' && "bg-blue-100 dark:bg-blue-900/30",
                      activity.type === 'warning' && "bg-amber-100 dark:bg-amber-900/30",
                      activity.type === 'error' && "bg-red-100 dark:bg-red-900/30"
                    )}>
                      <TrendingUp className={cn(
                        "w-4 h-4",
                        activity.type === 'success' && "text-green-600",
                        activity.type === 'info' && "text-blue-600",
                        activity.type === 'warning' && "text-amber-600",
                        activity.type === 'error' && "text-red-600"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <span className="text-xs text-muted-foreground">{format(activity.time, 'MMM d, h:mm a')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.actor} • {activity.target}</p>
                      {activity.value > 0 && (
                        <p className="text-xs font-medium text-accent mt-1">{formatKES(activity.value)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Alerts */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Bell className="w-4 h-4" />
                System Alerts
              </h3>
              <Badge variant="outline">{systemAlerts.length} alerts</Badge>
            </div>
            <div className="divide-y divide-border">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      alert.type === 'success' && "bg-green-100 dark:bg-green-900/30",
                      alert.type === 'info' && "bg-blue-100 dark:bg-blue-900/30",
                      alert.type === 'warning' && "bg-amber-100 dark:bg-amber-900/30",
                      alert.type === 'error' && "bg-red-100 dark:bg-red-900/30"
                    )}>
                      <AlertCircle className={cn(
                        "w-4 h-4",
                        alert.type === 'success' && "text-green-600",
                        alert.type === 'info' && "text-blue-600",
                        alert.type === 'warning' && "text-amber-600",
                        alert.type === 'error' && "text-red-600"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{alert.title}</p>
                        {alert.count && (
                          <Badge variant="secondary" className="text-xs">{alert.count}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{format(alert.time, 'MMM d, h:mm a')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quarterly Summary */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Quarterly Performance Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase py-3 px-4">Quarter</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase py-3 px-4">Submitted</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase py-3 px-4">Certified</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase py-3 px-4">Value</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase py-3 px-4">Payout</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase py-3 px-4">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {quarterlySummary.map((q) => (
                  <tr key={q.quarter} className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-medium">{q.quarter}</td>
                    <td className="py-3 px-4 text-right">{q.submitted}</td>
                    <td className="py-3 px-4 text-right text-green-600 font-medium">{q.certified}</td>
                    <td className="py-3 px-4 text-right font-semibold">{formatKES(q.value)}</td>
                    <td className="py-3 px-4 text-right text-accent font-semibold">{formatKES(q.payout)}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge className={cn(
                        (q.certified / q.submitted) * 100 > 70 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {((q.certified / q.submitted) * 100).toFixed(0)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
