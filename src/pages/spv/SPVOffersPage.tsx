import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Bill {
  id: string;
  invoice_number: string;
  amount: number;
  offer_amount: number | null;
  status: string;
  offer_date: string | null;
  created_at: string;
  mda_id: string;
}

interface MDA {
  id: string;
  name: string;
}

const SPVOffersPage = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Bill[]>([]);
  const [mdas, setMdas] = useState<Record<string, MDA>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);

      const { data: mdaData } = await supabase.from('mdas').select('id, name');
      if (mdaData) {
        const mdaMap: Record<string, MDA> = {};
        mdaData.forEach(mda => { mdaMap[mda.id] = mda; });
        setMdas(mdaMap);
      }

      const { data: offersData } = await supabase
        .from('bills')
        .select('*')
        .eq('spv_id', user.id)
        .order('offer_date', { ascending: false });
      
      if (offersData) setOffers(offersData as Bill[]);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; icon: React.ReactNode }> = {
      offer_made: { class: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
      offer_accepted: { class: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
      mda_reviewing: { class: 'bg-orange-100 text-orange-700', icon: <Clock className="w-3 h-3" /> },
      mda_approved: { class: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
      certified: { class: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-3 h-3" /> },
      rejected: { class: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" /> },
    };
    return config[status] || { class: 'bg-gray-100 text-gray-700', icon: null };
  };

  const pendingOffers = offers.filter(o => o.status === 'offer_made');
  const acceptedOffers = offers.filter(o => ['offer_accepted', 'mda_reviewing', 'mda_approved', 'terms_set', 'agreement_sent', 'treasury_reviewing'].includes(o.status));
  const completedOffers = offers.filter(o => o.status === 'certified');

  return (
    <PortalLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Offers</h1>
          <p className="text-muted-foreground">Track the status of your investment offers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="py-4">
              <p className="text-sm text-yellow-600">Pending Response</p>
              <p className="text-2xl font-bold text-yellow-700">{pendingOffers.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <p className="text-sm text-blue-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-700">{acceptedOffers.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-4">
              <p className="text-sm text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-700">{completedOffers.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Offers List */}
        <Card>
          <CardHeader>
            <CardTitle>All Offers</CardTitle>
            <CardDescription>Complete history of your offers</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : offers.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No offers made yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => {
                  const statusConfig = getStatusBadge(offer.status);
                  return (
                    <div 
                      key={offer.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-background">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{offer.invoice_number}</p>
                          <p className="text-sm text-muted-foreground">{mdas[offer.mda_id]?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Offered: {offer.offer_date ? format(new Date(offer.offer_date), 'PPP') : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₦{Number(offer.offer_amount || offer.amount).toLocaleString()}</p>
                        <Badge className={`${statusConfig.class} flex items-center gap-1 mt-1`}>
                          {statusConfig.icon}
                          {offer.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default SPVOffersPage;
