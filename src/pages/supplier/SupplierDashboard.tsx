import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Upload, Clock, CheckCircle, TrendingUp, Wallet, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import IdentityCard from '@/components/identity/IdentityCard';
import ProfileCompletionCard from '@/components/identity/ProfileCompletionCard';

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
      
      // Fetch bills
      const { data: billsData } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (billsData) setBills(billsData as Bill[]);

      // Fetch notifications
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (notifData) setNotifications(notifData as Notification[]);
      
      setLoading(false);
    };

    fetchData();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('supplier-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const stats = {
    totalBills: bills.length,
    pendingBills: bills.filter(b => ['submitted', 'under_review'].includes(b.status)).length,
    offersReceived: bills.filter(b => b.status === 'offer_made').length,
    totalValue: bills.reduce((sum, b) => sum + Number(b.amount), 0),
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-700',
      under_review: 'bg-yellow-100 text-yellow-700',
      offer_made: 'bg-purple-100 text-purple-700',
      offer_accepted: 'bg-green-100 text-green-700',
      mda_reviewing: 'bg-orange-100 text-orange-700',
      mda_approved: 'bg-green-100 text-green-700',
      certified: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <PortalLayout>
      <div className="p-6 space-y-6">
        {/* Identity Card */}
        <div className="flex flex-col lg:flex-row gap-4">
          <IdentityCard variant="full" className="flex-1" />
          <div className="flex flex-col gap-4 lg:w-80">
            <ProfileCompletionCard />
            <Button onClick={() => navigate('/supplier/submit-bill')} size="lg" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Submit New Bill
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalBills}</p>
                  <p className="text-sm text-muted-foreground">Total Bills</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-100">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingBills}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.offersReceived}</p>
                  <p className="text-sm text-muted-foreground">Offers Received</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <Wallet className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₦{(stats.totalValue / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bills */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Bills</CardTitle>
                <CardDescription>Your latest invoice submissions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/supplier/my-bills')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {bills.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No bills submitted yet</p>
                  <Button className="mt-4" onClick={() => navigate('/supplier/submit-bill')}>
                    Submit Your First Bill
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bills.map((bill) => (
                    <div 
                      key={bill.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/supplier/my-bills?id=${bill.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-background">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{bill.invoice_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(bill.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">₦{Number(bill.amount).toLocaleString()}</span>
                        <Badge className={getStatusBadge(bill.status)}>
                          {bill.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No notifications</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-3 rounded-lg ${notif.read ? 'bg-secondary/30' : 'bg-accent/10'}`}
                    >
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-muted-foreground">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
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
