import { useState, useEffect } from 'react';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FileText, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Bill {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  mda_approved_date: string | null;
  certificate_number: string | null;
  mda_id: string;
}

interface MDA {
  id: string;
  name: string;
}

const MDAApprovedPage = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [mdas, setMdas] = useState<Record<string, MDA>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: mdaData } = await supabase.from('mdas').select('id, name');
      if (mdaData) {
        const mdaMap: Record<string, MDA> = {};
        mdaData.forEach(mda => { mdaMap[mda.id] = mda; });
        setMdas(mdaMap);
      }

      const { data: billsData } = await supabase
        .from('bills')
        .select('*')
        .in('status', ['mda_approved', 'terms_set', 'agreement_sent', 'treasury_reviewing', 'certified'])
        .order('mda_approved_date', { ascending: false });
      
      if (billsData) setBills(billsData as Bill[]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      mda_approved: 'bg-blue-100 text-blue-700',
      terms_set: 'bg-purple-100 text-purple-700',
      agreement_sent: 'bg-indigo-100 text-indigo-700',
      treasury_reviewing: 'bg-orange-100 text-orange-700',
      certified: 'bg-green-100 text-green-700',
    };
    return config[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <PortalLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Approved Bills</h1>
          <p className="text-muted-foreground">Bills you have approved and their current status</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <p className="text-sm text-blue-600">Awaiting Treasury</p>
              <p className="text-2xl font-bold text-blue-700">
                {bills.filter(b => ['mda_approved', 'treasury_reviewing'].includes(b.status)).length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-4">
              <p className="text-sm text-green-600">Certified</p>
              <p className="text-2xl font-bold text-green-700">
                {bills.filter(b => b.status === 'certified').length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="py-4">
              <p className="text-sm text-purple-600">Total Value</p>
              <p className="text-2xl font-bold text-purple-700">
                KES {(bills.reduce((sum, b) => sum + Number(b.amount), 0) / 1000000).toFixed(1)}M
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bills List */}
        <Card>
          <CardHeader>
            <CardTitle>All Approved Bills</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : bills.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No approved bills yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bills.map((bill) => (
                  <div 
                    key={bill.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-background">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{bill.invoice_number}</p>
                        <p className="text-sm text-muted-foreground">{mdas[bill.mda_id]?.name}</p>
                        {bill.certificate_number && (
                          <p className="text-xs text-accent font-medium">{bill.certificate_number}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">KES {Number(bill.amount).toLocaleString()}</p>
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
      </div>
    </PortalLayout>
  );
};

export default MDAApprovedPage;
