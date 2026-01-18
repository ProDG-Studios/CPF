import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import SPVOfferForm from '@/components/bills/SPVOfferForm';

interface Bill {
  id: string;
  invoice_number: string;
  amount: number;
  offer_amount: number | null;
  offer_discount_rate: number | null;
  status: string;
  offer_date: string | null;
  created_at: string;
  mda_id: string;
  supplier_id: string;
  rejection_reason: string | null;
  last_rejected_by_supplier: boolean | null;
  last_rejection_date: string | null;
}

interface MDA {
  id: string;
  name: string;
}

interface SupplierProfile {
  company_name: string | null;
}

const SPVOffersPage = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Bill[]>([]);
  const [mdas, setMdas] = useState<Record<string, MDA>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRejectedBill, setSelectedRejectedBill] = useState<Bill | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showReofferModal, setShowReofferModal] = useState(false);
  const [supplierProfile, setSupplierProfile] = useState<SupplierProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: mdaData } = await supabase.from('mdas').select('id, name');
    if (mdaData) {
      const mdaMap: Record<string, MDA> = {};
      mdaData.forEach(mda => { mdaMap[mda.id] = mda; });
      setMdas(mdaMap);
    }

    // Fetch bills where this SPV has made offers (current or rejected)
    const { data: offersData } = await supabase
      .from('bills')
      .select('*')
      .eq('spv_id', user.id)
      .order('offer_date', { ascending: false, nullsFirst: false });
    
    if (offersData) setOffers(offersData as Bill[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const getStatusBadge = (status: string, lastRejected?: boolean | null) => {
    // Check if this is a rejected offer that needs attention
    if (lastRejected && status === 'submitted') {
      return { 
        class: 'bg-red-100 text-red-700 border-red-300', 
        icon: <AlertTriangle className="w-3 h-3" />, 
        label: 'Offer Rejected - Action Required' 
      };
    }

    const config: Record<string, { class: string; icon: React.ReactNode; label?: string }> = {
      offer_made: { class: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" />, label: 'Awaiting Response' },
      offer_accepted: { class: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" />, label: 'Offer Accepted' },
      mda_reviewing: { class: 'bg-orange-100 text-orange-700', icon: <Clock className="w-3 h-3" /> },
      mda_approved: { class: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
      certified: { class: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-3 h-3" /> },
      rejected: { class: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" />, label: 'Rejected' },
      submitted: { class: 'bg-blue-100 text-blue-700', icon: <Clock className="w-3 h-3" />, label: 'Awaiting New Offer' },
    };
    return config[status] || { class: 'bg-gray-100 text-gray-700', icon: null };
  };

  const pendingOffers = offers.filter(o => o.status === 'offer_made');
  const rejectedOffers = offers.filter(o => o.last_rejected_by_supplier && o.status === 'submitted');
  const acceptedOffers = offers.filter(o => ['offer_accepted', 'mda_reviewing', 'mda_approved', 'terms_set', 'agreement_sent', 'treasury_reviewing'].includes(o.status));
  const completedOffers = offers.filter(o => o.status === 'certified');

  const handleViewRejection = async (bill: Bill) => {
    setSelectedRejectedBill(bill);
    
    // Fetch supplier profile for the re-offer modal
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_name')
      .eq('user_id', bill.supplier_id)
      .single();
    
    if (profile) setSupplierProfile(profile);
    setShowRejectionModal(true);
  };

  const handleSubmitNewOffer = async (offerAmount: number, discountRate: number) => {
    if (!selectedRejectedBill || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('bills')
        .update({
          status: 'offer_made',
          offer_amount: offerAmount,
          offer_discount_rate: discountRate,
          offer_date: new Date().toISOString(),
          spv_id: user.id,
          rejection_reason: null,
          last_rejected_by_supplier: false,
          last_rejection_date: null,
        })
        .eq('id', selectedRejectedBill.id);

      if (error) throw error;

      // Notify supplier of new offer
      await supabase.from('notifications').insert({
        user_id: selectedRejectedBill.supplier_id,
        title: 'New Offer Received',
        message: `A revised offer of ₦${offerAmount.toLocaleString()} has been made on your invoice ${selectedRejectedBill.invoice_number}. Please review.`,
        type: 'info',
        bill_id: selectedRejectedBill.id,
      });

      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'SPV Resubmitted Offer',
        user_id: user.id,
        bill_id: selectedRejectedBill.id,
        details: {
          invoice_number: selectedRejectedBill.invoice_number,
          new_offer_amount: offerAmount,
          discount_rate: discountRate,
          previous_rejection_reason: selectedRejectedBill.rejection_reason,
        },
      });

      await fetchData();

      toast.success('New offer submitted successfully!');
      setShowReofferModal(false);
      setShowRejectionModal(false);
      setSelectedRejectedBill(null);
    } catch (error) {
      console.error('Error submitting new offer:', error);
      toast.error('Failed to submit new offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Offers</h1>
          <p className="text-muted-foreground">Track the status of your investment offers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="py-4">
              <p className="text-sm text-yellow-600">Pending Response</p>
              <p className="text-2xl font-bold text-yellow-700">{pendingOffers.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <p className="text-sm text-red-600">Rejected - Action Required</p>
                {rejectedOffers.length > 0 && (
                  <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
                )}
              </div>
              <p className="text-2xl font-bold text-red-700">{rejectedOffers.length}</p>
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
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="py-4">
              <p className="text-sm text-gray-600">Total Offers</p>
              <p className="text-2xl font-bold text-gray-700">{offers.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Rejected Offers Alert */}
        {rejectedOffers.length > 0 && (
          <Card className="border-red-300 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Offers Requiring Your Attention
              </CardTitle>
              <CardDescription className="text-red-600">
                The following offers were rejected by suppliers. Click to view the reason and submit a revised offer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rejectedOffers.map((offer) => (
                  <div 
                    key={offer.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white border border-red-200 cursor-pointer hover:bg-red-50 transition-colors"
                    onClick={() => handleViewRejection(offer)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-100">
                        <XCircle className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{offer.invoice_number}</p>
                        <p className="text-sm text-muted-foreground">{mdas[offer.mda_id]?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₦{Number(offer.amount).toLocaleString()}</p>
                      <p className="text-xs text-red-600">
                        Rejected: {offer.last_rejection_date ? format(new Date(offer.last_rejection_date), 'PPP') : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Offers List */}
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
                  const statusConfig = getStatusBadge(offer.status, offer.last_rejected_by_supplier);
                  const isRejected = offer.last_rejected_by_supplier && offer.status === 'submitted';
                  
                  return (
                    <div 
                      key={offer.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        isRejected ? 'bg-red-50 border border-red-200' : 'bg-secondary/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${isRejected ? 'bg-red-100' : 'bg-background'}`}>
                          <FileText className={`w-5 h-5 ${isRejected ? 'text-red-600' : ''}`} />
                        </div>
                        <div>
                          <p className="font-semibold">{offer.invoice_number}</p>
                          <p className="text-sm text-muted-foreground">{mdas[offer.mda_id]?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {isRejected ? (
                              <span className="text-red-600">
                                Rejected: {offer.last_rejection_date ? format(new Date(offer.last_rejection_date), 'PPP') : 'N/A'}
                              </span>
                            ) : (
                              <>Offered: {offer.offer_date ? format(new Date(offer.offer_date), 'PPP') : 'N/A'}</>
                            )}
                          </p>
                          {isRejected && offer.rejection_reason && (
                            <p className="text-xs text-red-600 mt-1 line-clamp-1">
                              Reason: {offer.rejection_reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="font-bold text-lg">₦{Number(offer.offer_amount || offer.amount).toLocaleString()}</p>
                        <Badge className={`${statusConfig.class} flex items-center gap-1`}>
                          {statusConfig.icon}
                          {statusConfig.label || offer.status.replace(/_/g, ' ')}
                        </Badge>
                        {isRejected && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="mt-1 border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleViewRejection(offer)}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Revise Offer
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rejection Details Modal */}
      <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
        <DialogContent className="max-w-md" aria-describedby="rejection-modal-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="w-5 h-5" />
              Offer Rejected
            </DialogTitle>
            <DialogDescription id="rejection-modal-description">
              Your offer on invoice {selectedRejectedBill?.invoice_number} was rejected by the supplier.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRejectedBill && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-semibold text-red-700 mb-2">Rejection Reason:</p>
                <p className="text-sm text-red-600">
                  {selectedRejectedBill.rejection_reason || 'No reason provided'}
                </p>
              </div>

              <div className="p-4 bg-secondary rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Invoice Amount</span>
                  <span className="font-medium">₦{Number(selectedRejectedBill.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MDA</span>
                  <span className="font-medium">{mdas[selectedRejectedBill.mda_id]?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rejected On</span>
                  <span className="font-medium">
                    {selectedRejectedBill.last_rejection_date 
                      ? format(new Date(selectedRejectedBill.last_rejection_date), 'PPP') 
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Consider the supplier's feedback and submit a revised offer with better terms.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowRejectionModal(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => { setShowRejectionModal(false); setShowReofferModal(true); }}
              className="bg-accent hover:bg-accent/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Submit New Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Re-offer Modal */}
      <Dialog open={showReofferModal} onOpenChange={setShowReofferModal}>
        <DialogContent className="max-w-lg" aria-describedby="reoffer-modal-description">
          <DialogHeader>
            <DialogTitle>Submit Revised Offer</DialogTitle>
            <DialogDescription id="reoffer-modal-description">
              Create a new offer for invoice {selectedRejectedBill?.invoice_number}. 
              Consider the supplier's previous feedback when setting your terms.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRejectedBill && (
            <>
              {selectedRejectedBill.rejection_reason && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 mb-4">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Previous Rejection Reason:</p>
                  <p className="text-sm text-amber-600">{selectedRejectedBill.rejection_reason}</p>
                </div>
              )}
              
              <SPVOfferForm
                billAmount={selectedRejectedBill.amount}
                supplierCompany={supplierProfile?.company_name || 'Supplier'}
                mdaName={mdas[selectedRejectedBill.mda_id]?.name}
                invoiceNumber={selectedRejectedBill.invoice_number}
                onSubmit={handleSubmitNewOffer}
                submitting={submitting}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

export default SPVOffersPage;