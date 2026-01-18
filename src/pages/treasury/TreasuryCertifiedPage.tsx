import { useState, useEffect } from 'react';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Shield, Download, Building2 } from 'lucide-react';
import { format } from 'date-fns';

interface Bill {
  id: string;
  invoice_number: string;
  amount: number;
  certificate_number: string | null;
  treasury_certified_date: string | null;
  mda_id: string;
}

interface MDA {
  id: string;
  name: string;
}

const TreasuryCertifiedPage = () => {
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
        .eq('status', 'certified')
        .order('treasury_certified_date', { ascending: false });
      
      if (billsData) setBills(billsData as Bill[]);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <PortalLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Certified Bills</h1>
          <p className="text-muted-foreground">Bills with issued payment certificates</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-4">
              <p className="text-sm text-green-600">Total Certified</p>
              <p className="text-2xl font-bold text-green-700">{bills.length} bills</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="py-4">
              <p className="text-sm text-emerald-600">Total Value</p>
              <p className="text-2xl font-bold text-emerald-700">
                KES {(bills.reduce((sum, b) => sum + Number(b.amount), 0) / 1000000).toFixed(1)}M
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bills List */}
        <Card>
          <CardHeader>
            <CardTitle>All Certified Bills</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : bills.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No certified bills yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bills.map((bill) => (
                  <div 
                    key={bill.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-green-100">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{bill.invoice_number}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {mdas[bill.mda_id]?.name}
                        </p>
                        <Badge variant="outline" className="mt-1 text-green-600 border-green-300">
                          {bill.certificate_number}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">KES {Number(bill.amount).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {bill.treasury_certified_date 
                          ? format(new Date(bill.treasury_certified_date), 'PPP')
                          : 'N/A'}
                      </p>
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

export default TreasuryCertifiedPage;
