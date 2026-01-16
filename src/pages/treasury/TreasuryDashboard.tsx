import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Clock, CheckCircle, Shield, Wallet } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import IdentityCard from '@/components/identity/IdentityCard';
import ProfileCompletionCard from '@/components/identity/ProfileCompletionCard';

interface Bill {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  mda_approved_date: string | null;
  certificate_number: string | null;
}

const TreasuryDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [pendingBills, setPendingBills] = useState<Bill[]>([]);
  const [certifiedBills, setCertifiedBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch bills awaiting certification
      const { data: pendingData } = await supabase
        .from('bills')
        .select('*')
        .in('status', ['mda_approved', 'terms_set', 'agreement_sent', 'treasury_reviewing'])
        .order('mda_approved_date', { ascending: true })
        .limit(5);
      
      if (pendingData) setPendingBills(pendingData as Bill[]);

      // Fetch certified bills
      const { data: certifiedData } = await supabase
        .from('bills')
        .select('*')
        .eq('status', 'certified')
        .order('treasury_certified_date', { ascending: false })
        .limit(5);
      
      if (certifiedData) setCertifiedBills(certifiedData as Bill[]);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const stats = {
    pendingCertification: pendingBills.length,
    certified: certifiedBills.length,
    pendingValue: pendingBills.reduce((sum, b) => sum + Number(b.amount), 0),
    certifiedValue: certifiedBills.reduce((sum, b) => sum + Number(b.amount), 0),
  };

  return (
    <PortalLayout>
      <div className="p-6 space-y-6">
        {/* Identity Section */}
        <div className="flex flex-col lg:flex-row gap-4">
          <IdentityCard variant="full" className="flex-1" />
          <div className="flex flex-col gap-4 lg:w-80">
            <ProfileCompletionCard />
            <Button onClick={() => navigate('/treasury/pending')} size="lg" className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              View Pending
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-100">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingCertification}</p>
                  <p className="text-sm text-muted-foreground">Pending Certification</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.certified}</p>
                  <p className="text-sm text-muted-foreground">Certified</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-100">
                  <Wallet className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₦{(stats.pendingValue / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-muted-foreground">Pending Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/20">
                  <CheckCircle className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₦{(stats.certifiedValue / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-muted-foreground">Certified Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Certification */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Certification</CardTitle>
                <CardDescription>MDA-approved bills awaiting your certification</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/treasury/pending')}>
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
                      onClick={() => navigate('/treasury/pending')}
                    >
                      <div>
                        <p className="font-medium">{bill.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {bill.mda_approved_date 
                            ? formatDistanceToNow(new Date(bill.mda_approved_date), { addSuffix: true })
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

          {/* Certified Bills */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recently Certified</CardTitle>
                <CardDescription>Bills with issued certificates</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/treasury/certified')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {certifiedBills.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No certified bills yet</p>
              ) : (
                <div className="space-y-3">
                  {certifiedBills.map((bill) => (
                    <div 
                      key={bill.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-100"
                    >
                      <div>
                        <p className="font-medium">{bill.invoice_number}</p>
                        <p className="text-xs text-accent font-medium">{bill.certificate_number}</p>
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

export default TreasuryDashboard;
