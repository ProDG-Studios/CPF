import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, Calendar, PenLine, Wallet } from 'lucide-react';
import { format, subDays } from 'date-fns';
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

// Import comprehensive mock data
import { mockAcceptedOffersData } from '@/data/comprehensiveMockData';

// Use comprehensive mock data
const mockAcceptedOffers = mockAcceptedOffersData;

const SPVOffersPage = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Bill[]>([]);
  const [mdas, setMdas] = useState<Record<string, MDA>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRejectedBill, setSelectedRejectedBill] = useState<Bill | null>(null);
  const [selectedAcceptedOffer, setSelectedAcceptedOffer] = useState<typeof mockAcceptedOffers[0] | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showReofferModal, setShowReofferModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [supplierProfile, setSupplierProfile] = useState<SupplierProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('accepted');

  // Terms form state - now includes years and coupon rate
  const [termsData, setTermsData] = useState({
    years: '1',
    payment_quarters: '4',
    start_quarter: 'Q1 2025',
    coupon_rate: '10',
  });

  // Generated term options to submit to MDA
  const [termOptions, setTermOptions] = useState<{id: string; label: string; years: number; quarters: number; coupon_rate: number; start_quarter: string}[]>([]);

  // Quarter breakdown for per-quarter coupon rates
  const [quarterBreakdown, setQuarterBreakdown] = useState<{quarter: string; amount: number; couponRate: number}[]>([]);

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

  useEffect(() => {
    // Generate quarter breakdown when modal opens
    if (selectedAcceptedOffer && showTermsModal) {
      const quarters = parseInt(termsData.payment_quarters);
      const startQ = termsData.start_quarter;
      const baseAmount = selectedAcceptedOffer.amount / quarters;
      
      const breakdown: {quarter: string; amount: number; couponRate: number}[] = [];
      const startYear = parseInt(startQ.split(' ')[1]);
      let qNum = parseInt(startQ.replace('Q', ''));
      let year = startYear;
      
      // Default coupon rates - varying by quarter position
      const defaultRates = [10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5];
      
      for (let i = 0; i < quarters; i++) {
        breakdown.push({
          quarter: `Q${qNum} ${year}`,
          amount: baseAmount,
          couponRate: defaultRates[i] || 12,
        });
        qNum++;
        if (qNum > 4) {
          qNum = 1;
          year++;
        }
      }
      setQuarterBreakdown(breakdown);
    }
  }, [selectedAcceptedOffer, showTermsModal, termsData.payment_quarters, termsData.start_quarter]);

  const getStatusBadge = (status: string, lastRejected?: boolean | null) => {
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

      await supabase.from('notifications').insert({
        user_id: selectedRejectedBill.supplier_id,
        title: 'New Offer Received',
        message: `A revised offer of KES ${offerAmount.toLocaleString()} has been made on your invoice ${selectedRejectedBill.invoice_number}. Please review.`,
        type: 'info',
        bill_id: selectedRejectedBill.id,
      });

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

  const handleSetTerms = (offer: typeof mockAcceptedOffers[0]) => {
    setSelectedAcceptedOffer(offer);
    setShowTermsModal(true);
  };

  const handleSubmitTerms = async () => {
    if (!selectedAcceptedOffer) return;

    setSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success(`Payment terms set for ${selectedAcceptedOffer.invoice_number}. Sent to MDA for approval.`);
    setShowTermsModal(false);
    
    // Show signing modal
    setShowSigningModal(true);
    setSubmitting(false);
  };

  const handleSign = async () => {
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Document signed successfully! Forwarded to MDA.');
    setShowSigningModal(false);
    setSelectedAcceptedOffer(null);
    setSubmitting(false);
  };

  const updateQuarterCouponRate = (index: number, couponRate: number) => {
    setQuarterBreakdown(prev => prev.map((q, i) => i === index ? { ...q, couponRate } : q));
  };

  const getTotalSpvMargin = () => {
    return quarterBreakdown.reduce((sum, q) => sum + (q.amount * q.couponRate / 100), 0);
  };

  return (
    <PortalLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Offers</h1>
          <p className="text-muted-foreground">Track and manage your investment offers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <p className="text-sm text-green-600">Accepted - Set Terms</p>
                {mockAcceptedOffers.length > 0 && (
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              <p className="text-2xl font-bold text-green-700">{mockAcceptedOffers.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="py-4">
              <p className="text-sm text-yellow-600">Pending Response</p>
              <p className="text-2xl font-bold text-yellow-700">{pendingOffers.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <p className="text-sm text-red-600">Rejected - Revise</p>
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
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="py-4">
              <p className="text-sm text-emerald-600">Completed</p>
              <p className="text-2xl font-bold text-emerald-700">{completedOffers.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="accepted" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Accepted ({mockAcceptedOffers.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pendingOffers.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Rejected ({rejectedOffers.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              All Offers
            </TabsTrigger>
          </TabsList>

          {/* Accepted Offers - Need Terms */}
          <TabsContent value="accepted" className="space-y-4 mt-4">
            {mockAcceptedOffers.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No accepted offers awaiting terms</p>
                </CardContent>
              </Card>
            ) : (
              mockAcceptedOffers.map((offer) => (
                <Card key={offer.id} className="border-green-200 bg-green-50/30">
                  <CardContent className="py-4">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{offer.invoice_number}</h3>
                          <Badge className="bg-green-100 text-green-700">Accepted - Set Terms</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{offer.supplier_name}</p>
                        <p className="text-sm text-muted-foreground">{offer.mda_name}</p>
                        {offer.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{offer.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Accepted: {format(new Date(offer.offer_accepted_date), 'PPP')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Wallet className="w-3 h-3" />
                            Discount: {offer.offer_discount_rate}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Invoice</p>
                          <p className="text-xl font-bold">KES {offer.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Your Offer</p>
                          <p className="text-lg font-semibold text-accent">KES {offer.offer_amount.toLocaleString()}</p>
                        </div>
                        <Button onClick={() => handleSetTerms(offer)}>
                          <PenLine className="w-4 h-4 mr-2" />
                          Set Payment Terms
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Pending Offers */}
          <TabsContent value="pending" className="space-y-4 mt-4">
            {pendingOffers.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No pending offers</p>
                </CardContent>
              </Card>
            ) : (
              pendingOffers.map((offer) => (
                <Card key={offer.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-yellow-100">
                          <Clock className="w-5 h-5 text-yellow-600" />
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
                        <p className="font-bold text-lg">KES {Number(offer.offer_amount).toLocaleString()}</p>
                        <Badge className="bg-yellow-100 text-yellow-700">Awaiting Response</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Rejected Offers */}
          <TabsContent value="rejected" className="space-y-4 mt-4">
            {rejectedOffers.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No rejected offers</p>
                </CardContent>
              </Card>
            ) : (
              rejectedOffers.map((offer) => (
                <Card key={offer.id} className="border-red-200 bg-red-50/30">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-red-100">
                          <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{offer.invoice_number}</p>
                          <p className="text-sm text-muted-foreground">{mdas[offer.mda_id]?.name}</p>
                          <p className="text-xs text-red-600">
                            Reason: {offer.rejection_reason || 'No reason provided'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="font-bold text-lg">KES {Number(offer.amount).toLocaleString()}</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleViewRejection(offer)}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Revise Offer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* All Offers */}
          <TabsContent value="all" className="space-y-3 mt-4">
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : offers.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No offers made yet</p>
                </CardContent>
              </Card>
            ) : (
              offers.map((offer) => {
                const statusConfig = getStatusBadge(offer.status, offer.last_rejected_by_supplier);
                return (
                  <Card key={offer.id} className="bg-secondary/30">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-background">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{offer.invoice_number}</p>
                            <p className="text-sm text-muted-foreground">{mdas[offer.mda_id]?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {offer.offer_date ? format(new Date(offer.offer_date), 'PPP') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">KES {Number(offer.offer_amount || offer.amount).toLocaleString()}</p>
                          <Badge className={statusConfig.class}>
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.label || offer.status.replace(/_/g, ' ')}</span>
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Set Payment Terms Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Set Payment Terms</DialogTitle>
            <DialogDescription>
              Define the payment schedule for {selectedAcceptedOffer?.invoice_number}. This will be sent to MDA for approval.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAcceptedOffer && (
            <div className="space-y-6 py-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">Invoice Amount</p>
                  <p className="text-xl font-bold">KES {selectedAcceptedOffer.amount.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Your Net Pay</p>
                  <p className="text-xl font-bold text-accent">KES {selectedAcceptedOffer.offer_amount.toLocaleString()}</p>
                </div>
              </div>

              {/* Terms Configuration */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Duration (Years)</Label>
                  <Select 
                    value={termsData.years} 
                    onValueChange={(v) => {
                      const years = parseFloat(v);
                      const quarters = Math.round(years * 4).toString();
                      setTermsData(prev => ({ ...prev, years: v, payment_quarters: quarters }));
                    }}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value="0.5">6 Months</SelectItem>
                      <SelectItem value="1">1 Year</SelectItem>
                      <SelectItem value="1.5">1.5 Years</SelectItem>
                      <SelectItem value="2">2 Years</SelectItem>
                      <SelectItem value="3">3 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quarters</Label>
                  <Select 
                    value={termsData.payment_quarters} 
                    onValueChange={(v) => setTermsData(prev => ({ ...prev, payment_quarters: v }))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value="2">2 Quarters</SelectItem>
                      <SelectItem value="4">4 Quarters</SelectItem>
                      <SelectItem value="6">6 Quarters</SelectItem>
                      <SelectItem value="8">8 Quarters</SelectItem>
                      <SelectItem value="12">12 Quarters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Quarter</Label>
                  <Select 
                    value={termsData.start_quarter} 
                    onValueChange={(v) => setTermsData(prev => ({ ...prev, start_quarter: v }))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value="Q1 2025">Q1 2025</SelectItem>
                      <SelectItem value="Q2 2025">Q2 2025</SelectItem>
                      <SelectItem value="Q3 2025">Q3 2025</SelectItem>
                      <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                      <SelectItem value="Q1 2026">Q1 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Coupon Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={termsData.coupon_rate}
                    onChange={(e) => setTermsData(prev => ({ ...prev, coupon_rate: e.target.value }))}
                    className="bg-background"
                  />
                </div>
              </div>

              {/* Summary of Terms Being Offered */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-700 mb-2">Terms Summary for MDA</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-bold text-purple-700">{termsData.years} Year(s)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Quarters</p>
                    <p className="font-bold text-purple-700">{termsData.payment_quarters}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Coupon Rate</p>
                    <p className="font-bold text-purple-700">{termsData.coupon_rate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start</p>
                    <p className="font-bold text-purple-700">{termsData.start_quarter}</p>
                  </div>
                </div>
              </div>

              {/* Per-Quarter Breakdown with Coupon Rates */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Per-Quarter Coupon Rates</h4>
                  <p className="text-sm text-muted-foreground">Set individual coupon rates for each payment</p>
                </div>
                <div className="space-y-2">
                  {quarterBreakdown.map((q, index) => (
                    <div key={q.quarter} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{q.quarter}</p>
                        <p className="text-sm text-muted-foreground">Principal: KES {q.amount.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Coupon Rate:</Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={q.couponRate}
                          onChange={(e) => updateQuarterCouponRate(index, parseFloat(e.target.value) || 0)}
                          className="w-20 h-8"
                        />
                        <span className="text-sm">%</span>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="text-xs text-muted-foreground">Coupon</p>
                        <p className="text-sm font-medium text-accent">KES {Math.round(q.amount * q.couponRate / 100).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* SPV Margin Summary */}
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-700">Total SPV Margin:</span>
                    <span className="text-lg font-bold text-green-700">KES {getTotalSpvMargin().toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Sum of all quarterly coupon payments</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <p>After you submit these terms, they will be sent to the MDA for approval. The MDA may accept or reject with suggested changes.</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTermsModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitTerms} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Terms to MDA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Signing Modal */}
      <Dialog open={showSigningModal} onOpenChange={setShowSigningModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenLine className="w-5 h-5" />
              Sign Document
            </DialogTitle>
            <DialogDescription>
              Sign the Deed of Assignment for {selectedAcceptedOffer?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-medium text-purple-700 mb-2">Document: Deed of Assignment</p>
              <p className="text-xs text-purple-600">
                By signing, you confirm that you agree to the payment terms and accept the assignment of the receivable.
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
            <Button onClick={handleSign} disabled={submitting}>
              {submitting ? 'Signing...' : 'Sign & Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Details Modal */}
      <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="w-5 h-5" />
              Offer Rejected
            </DialogTitle>
            <DialogDescription>
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
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRejectionModal(false)}>
              Close
            </Button>
            <Button onClick={() => { setShowRejectionModal(false); setShowReofferModal(true); }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Revise & Resubmit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Re-offer Modal */}
      <Dialog open={showReofferModal} onOpenChange={setShowReofferModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Revised Offer</DialogTitle>
            <DialogDescription>
              Adjust your offer terms for {selectedRejectedBill?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRejectedBill && (
            <SPVOfferForm
              billAmount={Number(selectedRejectedBill.amount)}
              supplierCompany={supplierProfile?.company_name || undefined}
              mdaName={mdas[selectedRejectedBill.mda_id]?.name}
              invoiceNumber={selectedRejectedBill.invoice_number}
              onSubmit={handleSubmitNewOffer}
              submitting={submitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

export default SPVOffersPage;