import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Shield, ExternalLink, Building2, Calendar, Wallet, Link } from 'lucide-react';
import { format } from 'date-fns';
import { useBlockchainDeed } from '@/hooks/useBlockchainDeed';

interface Bill {
  id: string;
  supplier_id: string;
  spv_id: string | null;
  invoice_number: string;
  invoice_date: string;
  amount: number;
  offer_amount: number | null;
  description: string | null;
  status: string;
  invoice_document_url: string | null;
  mda_approved_date: string | null;
  mda_notes: string | null;
  payment_quarters: number | null;
  payment_start_quarter: string | null;
  mda_id: string;
}

interface MDA {
  id: string;
  name: string;
}

const TreasuryPendingPage = () => {
  const { user } = useAuth();
  const { createDeed, loading: blockchainLoading } = useBlockchainDeed();
  const [bills, setBills] = useState<Bill[]>([]);
  const [mdas, setMdas] = useState<Record<string, MDA>>({});
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showCertifyModal, setShowCertifyModal] = useState(false);
  const [certificateNumber, setCertificateNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
        .in('status', ['mda_approved', 'terms_set', 'agreement_sent', 'treasury_reviewing'])
        .order('mda_approved_date', { ascending: true });
      
      if (billsData) setBills(billsData as Bill[]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const generateCertificateNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `CERT-${year}-${random}`;
  };

  const openCertifyModal = (bill: Bill) => {
    setSelectedBill(bill);
    setCertificateNumber(generateCertificateNumber());
    setShowCertifyModal(true);
  };

  const handleCertify = async () => {
    if (!selectedBill || !user || !certificateNumber) return;

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('bills')
        .update({
          status: 'certified',
          treasury_certified_by: user.id,
          treasury_certified_date: new Date().toISOString(),
          certificate_number: certificateNumber,
        })
        .eq('id', selectedBill.id);

      if (error) throw error;

      // Create blockchain deed for this certified bill
      if (selectedBill.spv_id) {
        try {
          const discountRate = selectedBill.offer_amount 
            ? ((Number(selectedBill.amount) - Number(selectedBill.offer_amount)) / Number(selectedBill.amount) * 100)
            : 0;

          const deedContent = {
            billId: selectedBill.id,
            assignorName: 'Supplier', // Would ideally fetch from profile
            procuringEntityName: mdas[selectedBill.mda_id]?.name || 'Unknown MDA',
            principalAmount: Number(selectedBill.amount),
            discountRate: discountRate,
            purchasePrice: Number(selectedBill.offer_amount) || Number(selectedBill.amount),
            invoiceNumber: selectedBill.invoice_number,
            invoiceDate: selectedBill.invoice_date,
            description: selectedBill.description || '',
            certificate_number: certificateNumber,
            payment_quarters: selectedBill.payment_quarters,
            payment_start_quarter: selectedBill.payment_start_quarter,
            certified_date: new Date().toISOString(),
          };

          await createDeed(
            selectedBill.id,              // billId
            selectedBill.supplier_id,     // assignorId
            selectedBill.mda_id,          // procuringEntityId
            Number(selectedBill.amount),  // principalAmount
            discountRate,                 // discountRate
            Number(selectedBill.offer_amount) || Number(selectedBill.amount), // purchasePrice
            deedContent                   // documentContent
          );

          console.log('Blockchain deed created for bill:', selectedBill.invoice_number);
        } catch (deedError) {
          console.error('Error creating blockchain deed:', deedError);
          // Don't fail the certification if deed creation fails
        }
      }

      // Notify supplier
      await supabase.from('notifications').insert({
        user_id: selectedBill.supplier_id,
        title: 'Bill Certified by Treasury',
        message: `Your invoice ${selectedBill.invoice_number} has been certified. Certificate: ${certificateNumber}. A Deed of Assignment has been created on the blockchain.`,
        type: 'success',
        bill_id: selectedBill.id,
      });

      // Notify SPV if exists
      if (selectedBill.spv_id) {
        await supabase.from('notifications').insert({
          user_id: selectedBill.spv_id,
          title: 'Bill Certified - Sign the Deed of Assignment',
          message: `Invoice ${selectedBill.invoice_number} has been certified by Treasury. A blockchain deed has been created. Please sign the Tripartite Deed of Assignment.`,
          type: 'success',
          bill_id: selectedBill.id,
        });
      }

      // Notify all Admin users
      const { data: adminUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminUsers && adminUsers.length > 0) {
        const adminNotifications = adminUsers.map(a => ({
          user_id: a.user_id,
          title: 'Bill Certified & Deed Created',
          message: `Invoice ${selectedBill.invoice_number} worth ₦${Number(selectedBill.amount).toLocaleString()} has been certified. Blockchain deed initiated.`,
          type: 'info',
          bill_id: selectedBill.id,
        }));
        await supabase.from('notifications').insert(adminNotifications);
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'Treasury Certified Bill',
        user_id: user.id,
        bill_id: selectedBill.id,
        details: { 
          invoice_number: selectedBill.invoice_number,
          certificate_number: certificateNumber,
          amount: Number(selectedBill.amount),
          blockchain_deed_created: !!selectedBill.spv_id
        }
      });

      setBills(prev => prev.filter(b => b.id !== selectedBill.id));
      toast.success('Bill certified! Blockchain deed has been created.');
      setShowCertifyModal(false);
      setSelectedBill(null);
    } catch (error) {
      console.error('Certification error:', error);
      toast.error('Failed to certify bill');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Certification</h1>
          <p className="text-muted-foreground">Review MDA-approved bills and issue certificates</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="py-4">
              <p className="text-sm text-orange-600">Total Pending</p>
              <p className="text-2xl font-bold text-orange-700">{bills.length} bills</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <p className="text-sm text-blue-600">Total Value</p>
              <p className="text-2xl font-bold text-blue-700">
                ₦{(bills.reduce((sum, b) => sum + Number(b.amount), 0) / 1000000).toFixed(1)}M
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bills List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Loading bills...</p>
              </CardContent>
            </Card>
          ) : bills.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No bills pending certification</p>
              </CardContent>
            </Card>
          ) : (
            bills.map((bill) => (
              <Card key={bill.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-secondary">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{bill.invoice_number}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {mdas[bill.mda_id]?.name || 'Unknown MDA'}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            MDA Approved: {bill.mda_approved_date 
                              ? format(new Date(bill.mda_approved_date), 'PPP')
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {bill.payment_quarters && bill.payment_start_quarter && (
                        <div className="pl-16 p-3 bg-secondary/50 rounded-lg">
                          <p className="text-sm font-medium">Payment Terms</p>
                          <p className="text-sm text-muted-foreground">
                            {bill.payment_quarters} quarters starting {bill.payment_start_quarter}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Quarterly: ₦{(Number(bill.amount) / bill.payment_quarters).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {bill.mda_notes && (
                        <div className="pl-16">
                          <p className="text-xs font-medium text-muted-foreground uppercase">MDA Notes</p>
                          <p className="text-sm">{bill.mda_notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="text-right space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Invoice Amount</p>
                        <p className="text-xl font-bold">₦{Number(bill.amount).toLocaleString()}</p>
                      </div>
                      {bill.offer_amount && (
                        <div>
                          <p className="text-sm text-muted-foreground">SPV Amount</p>
                          <p className="text-lg font-semibold text-accent">₦{Number(bill.offer_amount).toLocaleString()}</p>
                        </div>
                      )}
                      <Badge className="bg-orange-100 text-orange-700">MDA Approved</Badge>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    {bill.invoice_document_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={bill.invoice_document_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Document
                        </a>
                      </Button>
                    )}
                    <Button size="sm" onClick={() => openCertifyModal(bill)}>
                      <Shield className="w-4 h-4 mr-2" />
                      Issue Certificate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Certify Modal */}
        <Dialog open={showCertifyModal} onOpenChange={setShowCertifyModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Issue Payment Certificate</DialogTitle>
              <DialogDescription>
                Certify this bill for payment processing
              </DialogDescription>
            </DialogHeader>
            
            {selectedBill && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-secondary rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice</span>
                    <span className="font-medium">{selectedBill.invoice_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MDA</span>
                    <span>{mdas[selectedBill.mda_id]?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold">₦{Number(selectedBill.amount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Certificate Number</Label>
                  <Input
                    value={certificateNumber}
                    onChange={(e) => setCertificateNumber(e.target.value)}
                    placeholder="CERT-2025-00001"
                  />
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  <p className="font-medium">By issuing this certificate, you confirm:</p>
                  <ul className="list-disc list-inside mt-1 text-xs">
                    <li>The MDA approval is valid</li>
                    <li>Payment terms are acceptable</li>
                    <li>Funds will be allocated per the schedule</li>
                  </ul>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCertifyModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCertify} disabled={submitting || !certificateNumber}>
                {submitting ? 'Issuing...' : 'Issue Certificate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default TreasuryPendingPage;
