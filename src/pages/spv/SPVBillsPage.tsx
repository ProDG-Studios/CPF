import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Search, Filter, Wallet, Building2, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface Bill {
  id: string;
  supplier_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  amount: number;
  currency: string;
  description: string | null;
  work_description: string | null;
  contract_reference: string | null;
  status: string;
  invoice_document_url: string | null;
  created_at: string;
  mda_id: string;
}

interface MDA {
  id: string;
  name: string;
  code: string;
}

interface Profile {
  id: string;
  company_name: string | null;
  full_name: string | null;
}

const SPVBillsPage = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [mdas, setMdas] = useState<Record<string, MDA>>({});
  const [suppliers, setSuppliers] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mdaFilter, setMdaFilter] = useState('all');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [discountRate, setDiscountRate] = useState('5');
  const [submitting, setSubmitting] = useState(false);

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

      // Fetch available bills
      const { data: billsData } = await supabase
        .from('bills')
        .select('*')
        .in('status', ['submitted', 'under_review'])
        .order('amount', { ascending: false });
      
      if (billsData) {
        setBills(billsData as Bill[]);
        
        // Fetch supplier profiles
        const supplierIds = [...new Set(billsData.map(b => b.supplier_id))];
        if (supplierIds.length > 0) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('user_id, company_name, full_name')
            .in('user_id', supplierIds);
          
          if (profileData) {
            const supplierMap: Record<string, Profile> = {};
            profileData.forEach(p => { 
              supplierMap[p.user_id] = { id: p.user_id, company_name: p.company_name, full_name: p.full_name }; 
            });
            setSuppliers(supplierMap);
          }
        }
      }
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleMakeOffer = async () => {
    if (!selectedBill || !user) return;

    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid offer amount');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('bills')
        .update({
          status: 'offer_made',
          spv_id: user.id,
          offer_amount: amount,
          offer_discount_rate: parseFloat(discountRate),
          offer_date: new Date().toISOString(),
        })
        .eq('id', selectedBill.id);

      if (error) throw error;

      // Create notification for supplier
      await supabase.from('notifications').insert({
        user_id: selectedBill.supplier_id,
        title: 'New Offer Received!',
        message: `You received an offer of ₦${amount.toLocaleString()} for invoice ${selectedBill.invoice_number}`,
        type: 'success',
        bill_id: selectedBill.id,
      });

      setBills(prev => prev.filter(b => b.id !== selectedBill.id));
      toast.success('Offer submitted successfully!');
      setShowOfferModal(false);
      setSelectedBill(null);
      setOfferAmount('');
    } catch (error) {
      console.error('Offer error:', error);
      toast.error('Failed to submit offer');
    } finally {
      setSubmitting(false);
    }
  };

  const openOfferModal = (bill: Bill) => {
    setSelectedBill(bill);
    const suggestedOffer = Number(bill.amount) * (1 - parseFloat(discountRate) / 100);
    setOfferAmount(suggestedOffer.toFixed(2));
    setShowOfferModal(true);
  };

  const updateDiscount = (rate: string) => {
    setDiscountRate(rate);
    if (selectedBill) {
      const suggestedOffer = Number(selectedBill.amount) * (1 - parseFloat(rate) / 100);
      setOfferAmount(suggestedOffer.toFixed(2));
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMda = mdaFilter === 'all' || bill.mda_id === mdaFilter;
    return matchesSearch && matchesMda;
  });

  const mdaList = Object.values(mdas);

  return (
    <PortalLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Browse Bills</h1>
          <p className="text-muted-foreground">Find and make offers on supplier invoices</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={mdaFilter} onValueChange={setMdaFilter}>
                <SelectTrigger className="w-full md:w-64">
                  <Building2 className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by MDA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All MDAs</SelectItem>
                  {mdaList.map((mda) => (
                    <SelectItem key={mda.id} value={mda.id}>{mda.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <p className="text-sm text-blue-600">Total Available</p>
              <p className="text-2xl font-bold text-blue-700">{filteredBills.length} bills</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-4">
              <p className="text-sm text-green-600">Total Value</p>
              <p className="text-2xl font-bold text-green-700">
                ₦{(filteredBills.reduce((sum, b) => sum + Number(b.amount), 0) / 1000000).toFixed(1)}M
              </p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="py-4">
              <p className="text-sm text-purple-600">Average Bill</p>
              <p className="text-2xl font-bold text-purple-700">
                ₦{filteredBills.length > 0 
                  ? (filteredBills.reduce((sum, b) => sum + Number(b.amount), 0) / filteredBills.length / 1000000).toFixed(2) 
                  : 0}M
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p className="col-span-full text-center py-8 text-muted-foreground">Loading bills...</p>
          ) : filteredBills.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No bills available</p>
              </CardContent>
            </Card>
          ) : (
            filteredBills.map((bill) => (
              <Card key={bill.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{bill.invoice_number}</CardTitle>
                      <CardDescription>{mdas[bill.mda_id]?.name}</CardDescription>
                    </div>
                    <Badge variant="outline">Available</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold text-foreground">
                    ₦{Number(bill.amount).toLocaleString()}
                  </div>
                  
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Building2 className="w-3 h-3" />
                      {suppliers[bill.supplier_id]?.company_name || 'Unknown Supplier'}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(bill.invoice_date), 'MMM d, yyyy')}
                    </p>
                  </div>

                  {bill.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{bill.description}</p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => openOfferModal(bill)}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Make Offer
                    </Button>
                    {bill.invoice_document_url && (
                      <Button variant="outline" size="icon" asChild>
                        <a href={bill.invoice_document_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
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
              <DialogTitle>Make an Offer</DialogTitle>
              <DialogDescription>
                Submit your offer for invoice {selectedBill?.invoice_number}
              </DialogDescription>
            </DialogHeader>
            
            {selectedBill && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Invoice Amount</span>
                    <span className="font-bold">₦{Number(selectedBill.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MDA</span>
                    <span>{mdas[selectedBill.mda_id]?.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Discount Rate (%)</Label>
                  <Select value={discountRate} onValueChange={updateDiscount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="7">7%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="15">15%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offer">Your Offer Amount (₦)</Label>
                  <Input
                    id="offer"
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder="Enter offer amount"
                  />
                </div>

                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    You will pay <span className="font-bold text-accent">₦{parseFloat(offerAmount || '0').toLocaleString()}</span> now 
                    and receive <span className="font-bold">₦{Number(selectedBill.amount).toLocaleString()}</span> when 
                    the government pays.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowOfferModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleMakeOffer} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Offer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default SPVBillsPage;
