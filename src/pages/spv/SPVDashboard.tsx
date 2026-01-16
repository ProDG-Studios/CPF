import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FileText, TrendingUp, Wallet, Clock, CheckCircle, DollarSign, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Bill {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  created_at: string;
}

const SPVDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [myOffers, setMyOffers] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch all submitted bills
      const { data: billsData } = await supabase
        .from('bills')
        .select('*')
        .in('status', ['submitted', 'under_review'])
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (billsData) setBills(billsData as Bill[]);

      // Fetch bills where SPV made offers
      const { data: offersData } = await supabase
        .from('bills')
        .select('*')
        .not('spv_id', 'is', null)
        .order('offer_date', { ascending: false })
        .limit(5);
      
      if (offersData) setMyOffers(offersData as Bill[]);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const stats = {
    availableBills: bills.length,
    activeOffers: myOffers.filter(b => b.status === 'offer_made').length,
    acceptedOffers: myOffers.filter(b => ['offer_accepted', 'mda_reviewing', 'mda_approved', 'certified'].includes(b.status)).length,
    totalInvested: myOffers.filter(b => b.status === 'certified').reduce((sum, b) => sum + Number(b.amount), 0),
  };

  return (
    <PortalLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome, {profile?.full_name || profile?.spv_name || 'SPV'}
            </h1>
            <p className="text-muted-foreground">Browse bills and make investment offers</p>
          </div>
          <Button onClick={() => navigate('/spv/bills')}>
            <FileText className="w-4 h-4 mr-2" />
            Browse Bills
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.availableBills}</p>
                  <p className="text-sm text-muted-foreground">Available Bills</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeOffers}</p>
                  <p className="text-sm text-muted-foreground">Pending Offers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.acceptedOffers}</p>
                  <p className="text-sm text-muted-foreground">Accepted Offers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/20">
                  <DollarSign className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₦{(stats.totalInvested / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Available Bills */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Available Bills</CardTitle>
                <CardDescription>New bills ready for offers</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/spv/bills')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {bills.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No bills available</p>
              ) : (
                <div className="space-y-3">
                  {bills.map((bill) => (
                    <div 
                      key={bill.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer"
                      onClick={() => navigate('/spv/bills')}
                    >
                      <div>
                        <p className="font-medium">{bill.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(bill.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <span className="font-bold">₦{Number(bill.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Offers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Offers</CardTitle>
                <CardDescription>Track your investment offers</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/spv/offers')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {myOffers.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No offers made yet</p>
              ) : (
                <div className="space-y-3">
                  {myOffers.map((bill) => (
                    <div 
                      key={bill.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                    >
                      <div>
                        <p className="font-medium">{bill.invoice_number}</p>
                        <Badge variant="outline" className="mt-1">
                          {bill.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <span className="font-bold">₦{Number(bill.amount).toLocaleString()}</span>
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

export default SPVDashboard;
