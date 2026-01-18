import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Search, Filter, ExternalLink, CheckCircle, XCircle, Clock, Eye, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Bill {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  offer_amount: number | null;
  offer_discount_rate: number | null;
  offer_date: string | null;
  mda_approved_date: string | null;
  certificate_number: string | null;
  created_at: string;
  mda_id: string;
  spv_id: string | null;
}

interface MDA {
  id: string;
  name: string;
  code: string;
}

const MyBillsPage = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [mdas, setMdas] = useState<Record<string, MDA>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBills = async () => {
    const { data: billsData } = await supabase
      .from('bills')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (billsData) setBills(billsData as Bill[]);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch MDAs
      const { data: mdaData } = await supabase.from('mdas').select('*');
      if (mdaData) {
        const mdaMap: Record<string, MDA> = {};
        mdaData.forEach(mda => { mdaMap[mda.id] = mda; });
        setMdas(mdaMap);
      }

      await fetchBills();
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleAcceptOffer = async () => {
    if (!selectedBill || !user) return;

    setSubmitting(true);
    try {
      // Update status to offer_accepted (MDA will see it)
      const { error } = await supabase
        .from('bills')
        .update({
          status: 'offer_accepted',
          offer_accepted_date: new Date().toISOString(),
        })
        .eq('id', selectedBill.id);

      if (error) throw error;

      // Get the MDA for this bill
      const { data: mdaData } = await supabase
        .from('mdas')
        .select('name, id')
        .eq('id', selectedBill.mda_id)
        .single();

      // Find MDA users assigned to this MDA
      // Prefer matching by `mda_code` (we store the MDA id there), and fallback to legacy `mda_name`.
      let mdaUsers: Array<{ user_id: string }> = [];

      const { data: mdaUsersByCode } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('mda_code', selectedBill.mda_id);

      if (mdaUsersByCode && mdaUsersByCode.length > 0) {
        mdaUsers = mdaUsersByCode as Array<{ user_id: string }>;
      } else if (mdaData?.name) {
        const { data: mdaUsersByName } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('mda_name', mdaData.name);

        if (mdaUsersByName && mdaUsersByName.length > 0) {
          mdaUsers = mdaUsersByName as Array<{ user_id: string }>;
        }
      }

      // Notify MDA users
      if (mdaUsers.length > 0) {
        const mdaNotifications = mdaUsers.map((mdaUser) => ({
          user_id: mdaUser.user_id,
          title: 'Bill Pending Your Approval',
          message: `Invoice ${selectedBill.invoice_number} worth ₦${Number(selectedBill.amount).toLocaleString()} has been accepted by supplier and requires MDA approval.`,
          type: 'info',
          bill_id: selectedBill.id,
        }));
        await supabase.from('notifications').insert(mdaNotifications);
      }

      // Notify SPV that their offer was accepted
      if (selectedBill.spv_id) {
        await supabase.from('notifications').insert({
          user_id: selectedBill.spv_id,
          title: 'Offer Accepted!',
          message: `Your offer on invoice ${selectedBill.invoice_number} has been accepted by the supplier. Awaiting MDA approval.`,
          type: 'success',
          bill_id: selectedBill.id,
        });
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'Supplier Accepted Offer',
        user_id: user.id,
        bill_id: selectedBill.id,
        details: { 
          invoice_number: selectedBill.invoice_number,
          offer_amount: selectedBill.offer_amount,
          mda_name: mdaData?.name
        }
      });

      // Refetch bills to update UI
      await fetchBills();

      toast.success('Offer accepted! The bill has been sent to MDA for approval.');
      setShowOfferModal(false);
      setSelectedBill(null);
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast.error('Failed to accept offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectOffer = async () => {
    if (!selectedBill || !user || !rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setSubmitting(true);
    try {
      const spvId = selectedBill.spv_id;

      // Keep spv_id so the SPV can see it in "My Offers" and resubmit
      // Clear offer details but store rejection reason
      const { error } = await supabase
        .from('bills')
        .update({
          status: 'submitted',
          offer_amount: null,
          offer_discount_rate: null,
          offer_date: null,
          rejection_reason: rejectReason,
          last_rejected_by_supplier: true,
          last_rejection_date: new Date().toISOString(),
          // Keep spv_id so SPV can see it in their rejected offers
        })
        .eq('id', selectedBill.id);

      if (error) throw error;

      // Notify SPV of rejection with reason
      if (spvId) {
        await supabase.from('notifications').insert({
          user_id: spvId,
          title: 'Offer Rejected - Action Required',
          message: `Your offer on invoice ${selectedBill.invoice_number} was rejected. Reason: ${rejectReason}. You can revise and resubmit your offer.`,
          type: 'error',
          bill_id: selectedBill.id,
        });
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'Supplier Rejected Offer',
        user_id: user.id,
        bill_id: selectedBill.id,
        details: { 
          invoice_number: selectedBill.invoice_number,
          rejected_offer_amount: selectedBill.offer_amount,
          rejection_reason: rejectReason
        }
      });

      // Refetch bills
      await fetchBills();

      toast.success('Offer rejected. The SPV has been notified and can revise their offer.');
      setShowRejectModal(false);
      setShowOfferModal(false);
      setSelectedBill(null);
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting offer:', error);
      toast.error('Failed to reject offer');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-700',
      under_review: 'bg-yellow-100 text-yellow-700',
      offer_made: 'bg-purple-100 text-purple-700',
      offer_accepted: 'bg-green-100 text-green-700',
      mda_reviewing: 'bg-orange-100 text-orange-700',
      mda_approved: 'bg-green-100 text-green-700',
      terms_set: 'bg-teal-100 text-teal-700',
      agreement_sent: 'bg-indigo-100 text-indigo-700',
      treasury_reviewing: 'bg-cyan-100 text-cyan-700',
      certified: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'certified':
      case 'mda_approved':
      case 'offer_accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <PortalLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Bills</h1>
          <p className="text-muted-foreground">Track the status of your submitted invoices</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="offer_made">Offer Made</SelectItem>
                  <SelectItem value="offer_accepted">Offer Accepted</SelectItem>
                  <SelectItem value="mda_reviewing">MDA Reviewing</SelectItem>
                  <SelectItem value="mda_approved">MDA Approved</SelectItem>
                  <SelectItem value="certified">Certified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bills List */}
        <div className="space-y-3">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Loading bills...</p>
              </CardContent>
            </Card>
          ) : filteredBills.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No bills found</p>
              </CardContent>
            </Card>
          ) : (
            filteredBills.map((bill) => (
              <Card key={bill.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-secondary">
                        <FileText className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{bill.invoice_number}</h3>
                          {getStatusIcon(bill.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {mdas[bill.mda_id]?.name || 'Unknown MDA'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {format(new Date(bill.created_at), 'PPP')}
                        </p>
                        {bill.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {bill.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-lg font-bold">₦{Number(bill.amount).toLocaleString()}</p>
                      <Badge className={getStatusBadge(bill.status)}>
                        {bill.status.replace(/_/g, ' ')}
                      </Badge>
                      {bill.status === 'offer_made' && bill.offer_amount && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-purple-600">
                            Offer: ₦{Number(bill.offer_amount).toLocaleString()}
                          </p>
                          <Button 
                            size="sm" 
                            className="mt-2"
                            onClick={() => { setSelectedBill(bill); setShowOfferModal(true); }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Offer
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Offer Modal */}
        <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>SPV Offer Received</DialogTitle>
              <DialogDescription>
                Review the offer for invoice {selectedBill?.invoice_number}
              </DialogDescription>
            </DialogHeader>
            
            {selectedBill && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-secondary rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Original Amount</span>
                    <span className="font-medium">₦{Number(selectedBill.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Offer Amount</span>
                    <span className="font-bold text-accent">
                      ₦{Number(selectedBill.offer_amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount Rate</span>
                    <span className="font-medium">{selectedBill.offer_discount_rate}%</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You Receive Now</span>
                      <span className="font-bold text-lg text-green-600">
                        ₦{Number(selectedBill.offer_amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  By accepting this offer, your invoice will be sent to the MDA for approval. 
                  Once approved and certified by Treasury, you will receive the offered amount.
                </p>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => { setShowOfferModal(false); setShowRejectModal(true); }}
                disabled={submitting}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Offer
              </Button>
              <Button onClick={handleAcceptOffer} disabled={submitting}>
                <CheckCircle className="w-4 h-4 mr-2" />
                {submitting ? 'Processing...' : 'Accept Offer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rejection Modal */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Reject Offer
              </DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this offer. The SPV will be notified and can revise their offer.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {selectedBill && (
                <div className="p-3 bg-secondary rounded-lg text-sm">
                  <p><span className="text-muted-foreground">Invoice:</span> {selectedBill.invoice_number}</p>
                  <p><span className="text-muted-foreground">Offer:</span> ₦{Number(selectedBill.offer_amount).toLocaleString()}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="reject-reason">Rejection Reason *</Label>
                <Textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., Discount rate too high, need at least 95% of face value..."
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { setShowRejectModal(false); setRejectReason(''); }}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRejectOffer}
                disabled={submitting || !rejectReason.trim()}
              >
                {submitting ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default MyBillsPage;
