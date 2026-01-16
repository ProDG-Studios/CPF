import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Clock, CheckCircle, AlertCircle, Building2, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Bill {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  created_at: string;
  offer_accepted_date: string | null;
}

const MDADashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [pendingBills, setPendingBills] = useState<Bill[]>([]);
  const [approvedBills, setApprovedBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch bills waiting for MDA review
      const { data: pendingData } = await supabase
        .from('bills')
        .select('*')
        .in('status', ['offer_accepted', 'mda_reviewing'])
        .order('offer_accepted_date', { ascending: true })
        .limit(5);
      
      if (pendingData) setPendingBills(pendingData as Bill[]);

      // Fetch approved bills
      const { data: approvedData } = await supabase
        .from('bills')
        .select('*')
        .in('status', ['mda_approved', 'terms_set', 'agreement_sent', 'treasury_reviewing', 'certified'])
        .order('mda_approved_date', { ascending: false })
        .limit(5);
      
      if (approvedData) setApprovedBills(approvedData as Bill[]);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const stats = {
    pendingReview: pendingBills.length,
    approved: approvedBills.length,
    totalPending: pendingBills.reduce((sum, b) => sum + Number(b.amount), 0),
    totalApproved: approvedBills.reduce((sum, b) => sum + Number(b.amount), 0),
  };

  return (
    <PortalLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {profile?.mda_name || 'MDA'} Dashboard
            </h1>
            <p className="text-muted-foreground">Review and approve supplier bills</p>
          </div>
          <Button onClick={() => navigate('/mda/bills')}>
            <FileText className="w-4 h-4 mr-2" />
            View Pending Bills
          </Button>
        </div>

        {/* Profile Warning */}
        {!profile?.mda_name && (
          <Card className="border-warning bg-warning/5">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium">Complete Your Profile</p>
                <p className="text-sm text-muted-foreground">
                  Set your MDA affiliation to see relevant bills.
                </p>
              </div>
              <Button variant="outline" className="ml-auto" onClick={() => navigate('/mda/profile')}>
                Update Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-100">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingReview}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
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
                  <p className="text-2xl font-bold">{stats.approved}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-100">
                  <FileText className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₦{(stats.totalPending / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-muted-foreground">Pending Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/20">
                  <Building2 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₦{(stats.totalApproved / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-muted-foreground">Approved Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Bills */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Review</CardTitle>
                <CardDescription>Bills awaiting your approval</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/mda/bills')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {pendingBills.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No pending bills</p>
              ) : (
                <div className="space-y-3">
                  {pendingBills.map((bill) => (
                    <div 
                      key={bill.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-100 cursor-pointer hover:bg-orange-100/50"
                      onClick={() => navigate('/mda/bills')}
                    >
                      <div>
                        <p className="font-medium">{bill.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {bill.offer_accepted_date 
                            ? formatDistanceToNow(new Date(bill.offer_accepted_date), { addSuffix: true })
                            : 'Pending'}
                        </p>
                      </div>
                      <span className="font-bold">₦{Number(bill.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approved Bills */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recently Approved</CardTitle>
                <CardDescription>Bills you've approved</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/mda/approved')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {approvedBills.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No approved bills yet</p>
              ) : (
                <div className="space-y-3">
                  {approvedBills.map((bill) => (
                    <div 
                      key={bill.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-100"
                    >
                      <div>
                        <p className="font-medium">{bill.invoice_number}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
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

export default MDADashboard;
