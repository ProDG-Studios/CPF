import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Upload, Clock, CheckCircle, TrendingUp, Wallet, Bell, ArrowUpRight, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import IdentityCard from '@/components/identity/IdentityCard';
import ProfileCompletionCard from '@/components/identity/ProfileCompletionCard';
import { cn } from '@/lib/utils';

interface Bill {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  created_at: string;
  mda_id: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: billsData } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (billsData) setBills(billsData as Bill[]);

      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (notifData) setNotifications(notifData as Notification[]);
      setLoading(false);
    };
    fetchData();

    const channel = supabase
      .channel('supplier-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => { setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 5)); }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const stats = {
    totalBills: bills.length,
    pendingBills: bills.filter(b => ['submitted', 'under_review'].includes(b.status)).length,
    offersReceived: bills.filter(b => b.status === 'offer_made').length,
    totalValue: bills.reduce((sum, b) => sum + Number(b.amount), 0),
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; label: string }> = {
      submitted: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Submitted' },
      under_review: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'Under Review' },
      offer_made: { bg: 'bg-purple-500/10', text: 'text-purple-600', label: 'Offer Made' },
      offer_accepted: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', label: 'Accepted' },
      mda_approved: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Approved' },
      certified: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', label: 'Certified' },
      rejected: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Rejected' },
    };
    return configs[status] || { bg: 'bg-gray-500/10', text: 'text-gray-600', label: status };
  };

  return (
    <PortalLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your invoices and track payments</p>
          </div>
          <Button onClick={() => navigate('/supplier/submit-bill')} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 shadow-lg">
            <Upload className="w-5 h-5" />
            Submit New Bill
          </Button>
        </div>

        {/* Identity & Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <IdentityCard variant="full" />
          </div>
          <ProfileCompletionCard />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-animation">
          {[
            { label: 'Total Bills', value: stats.totalBills, icon: FileText, color: 'bg-blue-500', lightBg: 'bg-blue-500/10' },
            { label: 'Pending Review', value: stats.pendingBills, icon: Clock, color: 'bg-yellow-500', lightBg: 'bg-yellow-500/10' },
            { label: 'Offers Received', value: stats.offersReceived, icon: TrendingUp, color: 'bg-purple-500', lightBg: 'bg-purple-500/10' },
            { label: 'Total Value', value: `KES ${(stats.totalValue / 1000000).toFixed(1)}M`, icon: Wallet, color: 'bg-accent', lightBg: 'bg-accent/10' },
          ].map((stat, index) => (
            <Card key={index} className="stat-card group cursor-pointer hover:shadow-lg transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={cn("p-3 rounded-xl", stat.lightBg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color === 'bg-accent' ? 'text-accent' : stat.color.replace('bg-', 'text-'))} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Bills & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl">Recent Bills</CardTitle>
                <CardDescription>Your latest invoice submissions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/supplier/my-bills')} className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {bills.length === 0 ? (
                <div className="text-center py-12 bg-secondary/30 rounded-xl">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground mb-4">No bills submitted yet</p>
                  <Button onClick={() => navigate('/supplier/submit-bill')}>Submit Your First Bill</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bills.map((bill) => {
                    const statusConfig = getStatusConfig(bill.status);
                    return (
                      <div 
                        key={bill.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                        onClick={() => navigate(`/supplier/my-bills?id=${bill.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shadow-sm">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{bill.invoice_number}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(bill.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-foreground">KES {Number(bill.amount).toLocaleString()}</span>
                          <Badge className={cn("font-semibold", statusConfig.bg, statusConfig.text)}>{statusConfig.label}</Badge>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={cn("p-4 rounded-xl transition-colors", notif.read ? 'bg-secondary/30' : 'bg-accent/5 border border-accent/20')}>
                      <p className="text-sm font-medium text-foreground">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
};

export default SupplierDashboard;
