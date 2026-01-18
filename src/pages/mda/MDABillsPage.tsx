import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, CheckCircle, XCircle, ExternalLink, Building2, Calendar, User, PenLine, AlertTriangle } from 'lucide-react';
import { format, subDays } from 'date-fns';

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
  work_description: string | null;
  contract_reference: string | null;
  status: string;
  invoice_document_url: string | null;
  offer_accepted_date: string | null;
  mda_id: string;
  payment_quarters?: number;
  payment_start_quarter?: string;
}

interface Profile {
  company_name: string | null;
  full_name: string | null;
  address: string | null;
}

// Mock data for bills with SPV-set terms awaiting MDA approval
const mockPendingBills = [
  {
    id: 'mpb1',
    invoice_number: 'INV-2024-SPV001',
    supplier_name: 'Global Construction Ltd',
    spv_name: 'Capital Finance SPV',
    amount: 75000000,
    offer_amount: 69000000,
    offer_discount_rate: 8,
    payment_quarters: 4,
    payment_start_quarter: 'Q1 2025',
    quarter_rates: [12, 12, 11, 11],
    description: 'Highway construction phase 2',
    terms_submitted_date: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 'mpb2',
    invoice_number: 'INV-2024-SPV002',
    supplier_name: 'Premier Supplies Co',
    spv_name: 'Investment Partners SPV',
    amount: 32000000,
    offer_amount: 30400000,
    offer_discount_rate: 5,
    payment_quarters: 2,
    payment_start_quarter: 'Q2 2025',
    quarter_rates: [10, 10],
    description: 'Office furniture and equipment',
    terms_submitted_date: subDays(new Date(), 2).toISOString(),
  },
];

const MDABillsPage = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [suppliers, setSuppliers] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedMockBill, setSelectedMockBill] = useState<typeof mockPendingBills[0] | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [paymentQuarters, setPaymentQuarters] = useState('4');
  const [startQuarter, setStartQuarter] = useState('Q1 2025');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: billsData, error: billsError } = await supabase
        .from('bills')
        .select('*')
        .in('status', ['offer_accepted', 'mda_reviewing'])
        .order('offer_accepted_date', { ascending: true });
      
      if (billsError) {
        console.error('Error fetching bills:', billsError);
        setLoading(false);
        return;
      }
      
      if (billsData) {
        setBills(billsData as Bill[]);
        
        const supplierIds = [...new Set(billsData.map(b => b.supplier_id))];
        if (supplierIds.length > 0) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('user_id, company_name, full_name, address')
            .in('user_id', supplierIds);
          
          if (profileData) {
            const supplierMap: Record<string, Profile> = {};
            profileData.forEach(p => { 
              supplierMap[p.user_id] = { company_name: p.company_name, full_name: p.full_name, address: p.address }; 
            });
            setSuppliers(supplierMap);
          }
        }
      }
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleApprove = async () => {
    if (!selectedBill || !user) return;

    setSubmitting(true);

    try {
      const paymentTerms = {
        quarters: parseInt(paymentQuarters),
        start_quarter: startQuarter,
        quarterly_amount: Number(selectedBill.amount) / parseInt(paymentQuarters),
      };

      const { error } = await supabase
        .from('bills')
        .update({
          status: 'mda_approved',
          mda_approved_by: user.id,
          mda_approved_date: new Date().toISOString(),
          mda_notes: approvalNotes,
          payment_terms: paymentTerms,
          payment_quarters: parseInt(paymentQuarters),
          payment_start_quarter: startQuarter,
        })
        .eq('id', selectedBill.id);

      if (error) throw error;

      // Notify supplier
      await supabase.from('notifications').insert({
        user_id: selectedBill.supplier_id,
        title: 'Financial Offer Approved by MDA',
        message: `Your invoice ${selectedBill.invoice_number} has been approved. Payment terms: ${paymentQuarters} quarters starting ${startQuarter}.`,
        type: 'success',
        bill_id: selectedBill.id,
      });

      // Notify SPV
      if (selectedBill.spv_id) {
        await supabase.from('notifications').insert({
          user_id: selectedBill.spv_id,
          title: 'MDA Approved - Sign Document',
          message: `Invoice ${selectedBill.invoice_number} has been approved by MDA. Please sign the Letter of Authorization.`,
          type: 'success',
          bill_id: selectedBill.id,
        });
      }

      // Notify Treasury
      const { data: treasuryUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'treasury');

      if (treasuryUsers && treasuryUsers.length > 0) {
        const treasuryNotifications = treasuryUsers.map(t => ({
          user_id: t.user_id,
          title: 'Financial Offer Pending Certification',
          message: `Invoice ${selectedBill.invoice_number} worth ₦${Number(selectedBill.amount).toLocaleString()} requires Treasury certification.`,
          type: 'info',
          bill_id: selectedBill.id,
        }));
        await supabase.from('notifications').insert(treasuryNotifications);
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'MDA Approved Bill',
        user_id: user.id,
        bill_id: selectedBill.id,
        details: { 
          invoice_number: selectedBill.invoice_number,
          payment_quarters: parseInt(paymentQuarters),
          start_quarter: startQuarter
        }
      });

      setBills(prev => prev.filter(b => b.id !== selectedBill.id));
      setShowApprovalModal(false);
      
      // Show signing modal
      setShowSigningModal(true);
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Failed to approve bill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSign = async () => {
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Document signed! Bill moved to Treasury for certification.');
    setShowSigningModal(false);
    setSelectedBill(null);
    setApprovalNotes('');
    setSubmitting(false);
  };

  const handleReject = async () => {
    if (!selectedMockBill || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setSubmitting(true);
    
    // Simulate rejection - notify SPV
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success(`Terms rejected for ${selectedMockBill.invoice_number}. SPV has been notified to revise.`);
    setShowRejectModal(false);
    setSelectedMockBill(null);
    setRejectReason('');
    setSubmitting(false);
  };

  const handleMockApprove = (bill: typeof mockPendingBills[0]) => {
    setSelectedMockBill(bill);
    setPaymentQuarters(bill.payment_quarters.toString());
    setStartQuarter(bill.payment_start_quarter);
    setShowApprovalModal(true);
  };

  const handleMockReject = (bill: typeof mockPendingBills[0]) => {
    setSelectedMockBill(bill);
    setShowRejectModal(true);
  };

  const handleMockFinalApprove = async () => {
    if (!selectedMockBill) return;

    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success(`Terms approved for ${selectedMockBill.invoice_number}. Sent to Treasury.`);
    setShowApprovalModal(false);
    setShowSigningModal(true);
    setSubmitting(false);
  };

  const handleMockSign = async () => {
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Letter of Authorization signed! Forwarded to National Treasury.');
    setShowSigningModal(false);
    setSelectedMockBill(null);
    setSubmitting(false);
  };

  return (
    <PortalLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financial Offers</h1>
          <p className="text-muted-foreground">Review SPV payment terms and approve supplier invoices</p>
        </div>

        {/* Mock Bills with SPV Terms */}
        {mockPendingBills.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                SPV Terms Awaiting Approval ({mockPendingBills.length})
              </CardTitle>
              <CardDescription className="text-amber-600">
                Review the payment terms set by SPV and approve or reject
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                              <User className="w-3 h-3" />
                              {bill.supplier_name}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              SPV: {bill.spv_name}
                            </p>
                          </div>
                        </div>

                        {/* SPV Terms Summary */}
                        <div className="pl-16 p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-sm font-medium text-purple-700 mb-2">SPV Proposed Terms:</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Quarters</p>
                              <p className="font-medium">{bill.payment_quarters}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Start</p>
                              <p className="font-medium">{bill.payment_start_quarter}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Discount</p>
                              <p className="font-medium">{bill.offer_discount_rate}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Interest Rates</p>
                              <p className="font-medium">{bill.quarter_rates.join('%, ')}%</p>
                            </div>
                          </div>
                        </div>

                        {bill.description && (
                          <p className="text-sm text-muted-foreground pl-16">{bill.description}</p>
                        )}
                      </div>

                      <div className="text-right space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Invoice Amount</p>
                          <p className="text-xl font-bold">₦{bill.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">SPV Offer</p>
                          <p className="text-lg font-semibold text-accent">₦{bill.offer_amount.toLocaleString()}</p>
                        </div>
                        <Badge className="bg-amber-100 text-amber-700">Awaiting Your Approval</Badge>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive border-destructive/30"
                        onClick={() => handleMockReject(bill)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Terms
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleMockApprove(bill)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve & Sign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Real Bills from DB */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Other Pending Bills</h2>
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
                <p className="text-muted-foreground">No pending bills to review</p>
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
                            <User className="w-3 h-3" />
                            {suppliers[bill.supplier_id]?.company_name || 'Unknown Supplier'}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Submitted: {format(new Date(bill.invoice_date), 'PPP')}
                          </p>
                        </div>
                      </div>

                      {bill.description && (
                        <p className="text-sm text-muted-foreground pl-16">{bill.description}</p>
                      )}
                    </div>

                    <div className="text-right space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Invoice Amount</p>
                        <p className="text-xl font-bold">₦{Number(bill.amount).toLocaleString()}</p>
                      </div>
                      {bill.offer_amount && (
                        <div>
                          <p className="text-sm text-muted-foreground">SPV Offer</p>
                          <p className="text-lg font-semibold text-accent">₦{Number(bill.offer_amount).toLocaleString()}</p>
                        </div>
                      )}
                      <Badge className="bg-orange-100 text-orange-700">Awaiting Approval</Badge>
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
                    <Button 
                      size="sm"
                      onClick={() => { setSelectedBill(bill); setShowApprovalModal(true); }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Set Terms
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Approval Modal for Real Bills */}
        <Dialog open={showApprovalModal && selectedBill !== null} onOpenChange={(open) => { if (!open) { setShowApprovalModal(false); setSelectedBill(null); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Approve Bill & Set Payment Terms</DialogTitle>
              <DialogDescription>
                Confirm the work was done and set the repayment schedule
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
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold">₦{Number(selectedBill.amount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Quarters</Label>
                    <Select value={paymentQuarters} onValueChange={setPaymentQuarters}>
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
                    <Select value={startQuarter} onValueChange={setStartQuarter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Q1 2025">Q1 2025</SelectItem>
                        <SelectItem value="Q2 2025">Q2 2025</SelectItem>
                        <SelectItem value="Q3 2025">Q3 2025</SelectItem>
                        <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-3 bg-accent/10 rounded-lg text-sm">
                  <p>
                    Quarterly Payment: <span className="font-bold">
                      ₦{(Number(selectedBill.amount) / parseInt(paymentQuarters)).toLocaleString()}
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Approval Notes (Optional)</Label>
                  <Textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Add any notes about this approval..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowApprovalModal(false); setSelectedBill(null); }}>
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={submitting}>
                {submitting ? 'Approving...' : 'Approve Bill'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approval Modal for Mock Bills */}
        <Dialog open={showApprovalModal && selectedMockBill !== null && selectedBill === null} onOpenChange={(open) => { if (!open) { setShowApprovalModal(false); setSelectedMockBill(null); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Approve SPV Terms</DialogTitle>
              <DialogDescription>
                Review and approve the payment terms for {selectedMockBill?.invoice_number}
              </DialogDescription>
            </DialogHeader>
            
            {selectedMockBill && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-secondary rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice Amount</span>
                    <span className="font-bold">₦{selectedMockBill.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SPV Offer</span>
                    <span className="font-bold text-accent">₦{selectedMockBill.offer_amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="font-medium text-purple-700 mb-2">SPV Proposed Terms:</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Quarters</p>
                      <p className="font-medium">{selectedMockBill.payment_quarters}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Start Quarter</p>
                      <p className="font-medium">{selectedMockBill.payment_start_quarter}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-muted-foreground text-sm">Interest Rates per Quarter:</p>
                    <p className="font-medium">{selectedMockBill.quarter_rates.join('%, ')}%</p>
                  </div>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  By approving, you confirm that the terms are acceptable and the bill will be forwarded to National Treasury.
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowApprovalModal(false); setSelectedMockBill(null); }}>
                Cancel
              </Button>
              <Button onClick={handleMockFinalApprove} disabled={submitting}>
                {submitting ? 'Approving...' : 'Approve Terms'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rejection Modal */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-700">
                <XCircle className="w-5 h-5" />
                Reject SPV Terms
              </DialogTitle>
              <DialogDescription>
                Provide a reason for rejection. The SPV will be notified to revise the terms.
              </DialogDescription>
            </DialogHeader>
            
            {selectedMockBill && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="font-medium">{selectedMockBill.invoice_number}</p>
                  <p className="text-sm text-muted-foreground">{selectedMockBill.supplier_name}</p>
                </div>

                <div className="space-y-2">
                  <Label>Rejection Reason *</Label>
                  <Textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain why these terms are not acceptable..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowRejectModal(false); setSelectedMockBill(null); setRejectReason(''); }}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject} 
                disabled={submitting || !rejectReason.trim()}
              >
                {submitting ? 'Rejecting...' : 'Reject & Notify SPV'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Signing Modal */}
        <Dialog open={showSigningModal} onOpenChange={setShowSigningModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PenLine className="w-5 h-5" />
                Sign Document
              </DialogTitle>
              <DialogDescription>
                Sign the Letter of Authorization
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-700 mb-2">Document: Letter of Authorization</p>
                <p className="text-xs text-green-600">
                  By signing, you authorize the National Treasury to proceed with the payment schedule as defined.
                </p>
              </div>

              <div className="p-4 border-2 border-dashed border-muted rounded-lg text-center">
                <PenLine className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click below to apply your digital signature</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSigningModal(false)}>
                Cancel
              </Button>
              <Button onClick={selectedMockBill ? handleMockSign : handleSign} disabled={submitting}>
                {submitting ? 'Signing...' : 'Sign & Forward to Treasury'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default MDABillsPage;