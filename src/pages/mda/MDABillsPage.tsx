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
import { FileText, CheckCircle, XCircle, ExternalLink, Building2, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface Bill {
  id: string;
  supplier_id: string;
  invoice_number: string;
  invoice_date: string;
  amount: number;
  offer_amount: number | null;
  description: string | null;
  work_description: string | null;
  contract_reference: string | null;
  status: string;
  invoice_document_url: string | null;
  offer_accepted_date: string | null;
  mda_id: string;
}

interface Profile {
  company_name: string | null;
  full_name: string | null;
  address: string | null;
}

const MDABillsPage = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [suppliers, setSuppliers] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [paymentQuarters, setPaymentQuarters] = useState('4');
  const [startQuarter, setStartQuarter] = useState('Q1 2025');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Get all bills with status offer_accepted or mda_reviewing
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

      console.log('MDA Bills fetched:', billsData?.length, 'bills with status offer_accepted/mda_reviewing');
      
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
        title: 'Bill Approved by MDA',
        message: `Your invoice ${selectedBill.invoice_number} has been approved. Payment terms: ${paymentQuarters} quarters starting ${startQuarter}.`,
        type: 'success',
        bill_id: selectedBill.id,
      });

      // Get the SPV from the bill and notify them
      const { data: billWithSpv } = await supabase
        .from('bills')
        .select('spv_id')
        .eq('id', selectedBill.id)
        .single();

      if (billWithSpv?.spv_id) {
        await supabase.from('notifications').insert({
          user_id: billWithSpv.spv_id,
          title: 'MDA Approved Bill',
          message: `Invoice ${selectedBill.invoice_number} has been approved by MDA. Awaiting Treasury certification.`,
          type: 'success',
          bill_id: selectedBill.id,
        });
      }

      // Notify all Treasury users
      const { data: treasuryUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'treasury');

      if (treasuryUsers && treasuryUsers.length > 0) {
        const treasuryNotifications = treasuryUsers.map(t => ({
          user_id: t.user_id,
          title: 'Bill Pending Certification',
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
      toast.success('Bill approved! Moving to Treasury for certification.');
      setShowApprovalModal(false);
      setSelectedBill(null);
      setApprovalNotes('');
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Failed to approve bill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (bill: Bill) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bills')
        .update({
          status: 'rejected',
          mda_approved_by: user.id,
          mda_approved_date: new Date().toISOString(),
          mda_notes: 'Rejected by MDA',
        })
        .eq('id', bill.id);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: bill.supplier_id,
        title: 'Bill Rejected',
        message: `Your invoice ${bill.invoice_number} has been rejected by the MDA.`,
        type: 'error',
        bill_id: bill.id,
      });

      setBills(prev => prev.filter(b => b.id !== bill.id));
      toast.success('Bill rejected');
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Failed to reject bill');
    }
  };

  return (
    <PortalLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Bills</h1>
          <p className="text-muted-foreground">Review and approve supplier invoices</p>
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

                      {bill.work_description && (
                        <div className="pl-16">
                          <p className="text-xs font-medium text-muted-foreground uppercase">Work Description</p>
                          <p className="text-sm">{bill.work_description}</p>
                        </div>
                      )}

                      {bill.contract_reference && (
                        <p className="text-sm text-muted-foreground pl-16">
                          Contract Ref: {bill.contract_reference}
                        </p>
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
                      variant="outline" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => handleReject(bill)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
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

        {/* Approval Modal */}
        <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
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
              <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={submitting}>
                {submitting ? 'Approving...' : 'Approve Bill'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default MDABillsPage;
