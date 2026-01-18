import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Shield, ExternalLink, Building2, Calendar, Wallet, Edit, Eye, CheckCircle, Clock } from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { useBlockchainDeed } from '@/hooks/useBlockchainDeed';

interface Bill {
  id: string;
  supplier_id: string;
  spv_id: string | null;
  invoice_number: string;
  invoice_date: string;
  amount: number;
  offer_amount: number | null;
  offer_discount_rate: number | null;
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

// Import comprehensive mock data
import { mockTreasuryPendingBillsData, getTreasuryStats } from '@/data/comprehensiveMockData';

// Use comprehensive mock data
const mockPendingBills = mockTreasuryPendingBillsData;

const TreasuryPendingPage = () => {
  const { user } = useAuth();
  const { createDeed, loading: blockchainLoading } = useBlockchainDeed();
  const [bills, setBills] = useState<Bill[]>([]);
  const [mdas, setMdas] = useState<Record<string, MDA>>({});
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedMockBill, setSelectedMockBill] = useState<typeof mockPendingBills[0] | null>(null);
  const [showCertifyModal, setShowCertifyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAmendModal, setShowAmendModal] = useState(false);
  const [certificateNumber, setCertificateNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  // Amend form state
  const [amendData, setAmendData] = useState({
    payment_quarters: '4',
    payment_start_quarter: 'Q1 2025',
    discount_rate: '5',
    notes: '',
  });

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

  const openDetailsModal = (bill: typeof mockPendingBills[0]) => {
    setSelectedMockBill(bill);
    setAmendData({
      payment_quarters: bill.payment_quarters.toString(),
      payment_start_quarter: bill.payment_start_quarter,
      discount_rate: bill.offer_discount_rate.toString(),
      notes: '',
    });
    setShowDetailsModal(true);
  };

  const handleAmendTerms = () => {
    setShowDetailsModal(false);
    setShowAmendModal(true);
  };

  const handleConfirmAmendment = async () => {
    if (!selectedMockBill) return;

    setSubmitting(true);

    // Simulate amendment notification
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success(`Terms amended for ${selectedMockBill.invoice_number}. SPV, MDA, and Supplier have been notified.`);
    setShowAmendModal(false);
    setSelectedMockBill(null);
    setSubmitting(false);
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
            assignorName: 'Supplier',
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
            selectedBill.id,
            selectedBill.supplier_id,
            selectedBill.mda_id,
            Number(selectedBill.amount),
            discountRate,
            Number(selectedBill.offer_amount) || Number(selectedBill.amount),
            deedContent
          );

          console.log('Blockchain deed created for bill:', selectedBill.invoice_number);
        } catch (deedError) {
          console.error('Error creating blockchain deed:', deedError);
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

  const totalPending = bills.length + mockPendingBills.length;
  const totalValue = bills.reduce((sum, b) => sum + Number(b.amount), 0) + 
                     mockPendingBills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <PortalLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Certification</h1>
          <p className="text-muted-foreground">Review MDA-approved bills, view details, and issue certificates</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="py-4">
              <p className="text-sm text-orange-600">Total Pending</p>
              <p className="text-2xl font-bold text-orange-700">{totalPending} bills</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <p className="text-sm text-blue-600">Total Value</p>
              <p className="text-2xl font-bold text-blue-700">
                ₦{(totalValue / 1000000).toFixed(1)}M
              </p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-4">
              <p className="text-sm text-green-600">Ready to Certify</p>
              <p className="text-2xl font-bold text-green-700">{totalPending}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({totalPending})
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Full Review
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {/* Mock Bills */}
            {mockPendingBills.map((bill) => (
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
                            {bill.mda_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{bill.supplier_name} • SPV: {bill.spv_name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            MDA Approved: {format(new Date(bill.mda_approved_date), 'PPP')}
                          </p>
                        </div>
                      </div>

                      <div className="pl-16 p-3 bg-secondary/50 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Discount Rate</p>
                          <p className="font-medium">{bill.offer_discount_rate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quarters</p>
                          <p className="font-medium">{bill.payment_quarters}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Start Quarter</p>
                          <p className="font-medium">{bill.payment_start_quarter}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Per Quarter</p>
                          <p className="font-medium">₦{(bill.amount / bill.payment_quarters).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Invoice Amount</p>
                        <p className="text-xl font-bold">₦{bill.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">SPV Amount</p>
                        <p className="text-lg font-semibold text-accent">₦{bill.offer_amount.toLocaleString()}</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700">MDA Approved</Badge>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => openDetailsModal(bill)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View & Amend
                    </Button>
                    <Button size="sm" onClick={() => toast.success('Certification modal would open')}>
                      <Shield className="w-4 h-4 mr-2" />
                      Issue Certificate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Real Bills from DB */}
            {bills.map((bill) => (
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
            ))}

            {loading && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">Loading bills...</p>
                </CardContent>
              </Card>
            )}

            {!loading && bills.length === 0 && mockPendingBills.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No bills pending certification</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="review" className="mt-4">
            <Card>
              <CardContent className="py-8 text-center">
                <Eye className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Full review panel - select a bill from the Pending tab to review details</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bill Details</DialogTitle>
              <DialogDescription>
                Review all details and terms for {selectedMockBill?.invoice_number}
              </DialogDescription>
            </DialogHeader>
            
            {selectedMockBill && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Invoice Amount</p>
                    <p className="text-xl font-bold">₦{selectedMockBill.amount.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">SPV Offer</p>
                    <p className="text-xl font-bold text-accent">₦{selectedMockBill.offer_amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Supplier</p>
                    <p className="font-medium">{selectedMockBill.supplier_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">MDA</p>
                    <p className="font-medium">{selectedMockBill.mda_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Discount Rate</p>
                    <p className="font-medium">{selectedMockBill.offer_discount_rate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Description</p>
                    <p className="font-medium">{selectedMockBill.description}</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-2">Payment Terms</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Quarters</p>
                      <p className="font-medium">{selectedMockBill.payment_quarters}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Start Quarter</p>
                      <p className="font-medium">{selectedMockBill.payment_start_quarter}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Per Quarter</p>
                      <p className="font-medium">₦{(selectedMockBill.amount / selectedMockBill.payment_quarters).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              <Button onClick={handleAmendTerms}>
                <Edit className="w-4 h-4 mr-2" />
                Amend Terms
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Amend Terms Modal */}
        <Dialog open={showAmendModal} onOpenChange={setShowAmendModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Amend Terms</DialogTitle>
              <DialogDescription>
                Modify the payment terms for {selectedMockBill?.invoice_number}. All parties will be notified.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Quarters</Label>
                  <Select value={amendData.payment_quarters} onValueChange={(v) => setAmendData(prev => ({ ...prev, payment_quarters: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Quarters</SelectItem>
                      <SelectItem value="4">4 Quarters</SelectItem>
                      <SelectItem value="6">6 Quarters</SelectItem>
                      <SelectItem value="8">8 Quarters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Quarter</Label>
                  <Select value={amendData.payment_start_quarter} onValueChange={(v) => setAmendData(prev => ({ ...prev, payment_start_quarter: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1 2025">Q1 2025</SelectItem>
                      <SelectItem value="Q2 2025">Q2 2025</SelectItem>
                      <SelectItem value="Q3 2025">Q3 2025</SelectItem>
                      <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                      <SelectItem value="Q1 2026">Q1 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Discount Rate (%)</Label>
                <Input
                  type="number"
                  value={amendData.discount_rate}
                  onChange={(e) => setAmendData(prev => ({ ...prev, discount_rate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Amendment Notes</Label>
                <Textarea
                  value={amendData.notes}
                  onChange={(e) => setAmendData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Reason for amendment..."
                  rows={3}
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                <p className="font-medium">This will notify:</p>
                <ul className="list-disc list-inside mt-1 text-xs">
                  <li>The SPV who made the offer</li>
                  <li>The MDA who approved the bill</li>
                  <li>The Supplier who submitted the invoice</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAmendModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmAmendment} disabled={submitting}>
                {submitting ? 'Saving...' : 'Confirm Amendment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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