import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import TopBar from '@/components/layout/TopBar';
import BillDetailModal from '@/components/bills/BillDetailModal';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye,
  Download,
  CheckCircle,
  Clock,
  Briefcase,
  Building2,
  Landmark
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Bill {
  id: string;
  invoice_number: string;
  description: string;
  amount: number;
  status: string;
  created_at: string;
  supplier_id: string;
  mda_id: string;
  spv_id?: string;
  offer_amount?: number;
  offer_discount_rate?: number;
  mda_approved_date?: string;
  treasury_certified_date?: string;
  certificate_number?: string;
}

interface Profile {
  user_id: string;
  full_name: string;
  email: string;
  company_name?: string;
  mda_name?: string;
  spv_name?: string;
}

const AdminBillsPage = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [mdas, setMdas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [billsRes, profilesRes, mdasRes] = await Promise.all([
        supabase.from('bills').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('user_id, full_name, email, company_name, mda_name, spv_name'),
        supabase.from('mdas').select('*'),
      ]);

      if (billsRes.error) throw billsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      setBills(billsRes.data || []);
      setProfiles(profilesRes.data || []);
      setMdas(mdasRes.data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const getProfileName = (userId: string) => {
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.company_name || profile?.full_name || 'Unknown';
  };

  const getMDAName = (mdaId: string) => {
    const mda = mdas.find(m => m.id === mdaId);
    return mda?.name || 'Unknown MDA';
  };

  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const matchesSearch = 
        bill.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getProfileName(bill.supplier_id).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [bills, searchTerm, statusFilter, profiles]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <FileText className="w-4 h-4" />;
      case 'spv_offered': return <Briefcase className="w-4 h-4" />;
      case 'offer_accepted': return <CheckCircle className="w-4 h-4" />;
      case 'mda_approved': return <Building2 className="w-4 h-4" />;
      case 'treasury_certified': return <Landmark className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'spv_offered': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'offer_accepted': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'mda_approved': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'treasury_certified': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatStatus = (status: string) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  const handleViewBill = async (bill: Bill) => {
    // Fetch additional details for the modal
    const supplierProfile = profiles.find(p => p.user_id === bill.supplier_id);
    const spvProfile = bill.spv_id ? profiles.find(p => p.user_id === bill.spv_id) : null;
    const mda = mdas.find(m => m.id === bill.mda_id);

    setSelectedBill({
      ...bill,
      supplier: supplierProfile,
      spv: spvProfile,
      mda,
    });
    setShowDetailModal(true);
  };

  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Supplier', 'MDA', 'Amount', 'Status', 'Created Date'];
    const rows = filteredBills.map(bill => [
      bill.invoice_number,
      getProfileName(bill.supplier_id),
      getMDAName(bill.mda_id),
      bill.amount,
      bill.status,
      new Date(bill.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bills-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Bills exported to CSV');
  };

  const totalAmount = filteredBills.reduce((sum, b) => sum + Number(b.amount || 0), 0);

  const statusCounts = useMemo(() => ({
    all: bills.length,
    submitted: bills.filter(b => b.status === 'submitted').length,
    spv_offered: bills.filter(b => b.status === 'spv_offered').length,
    offer_accepted: bills.filter(b => b.status === 'offer_accepted').length,
    mda_approved: bills.filter(b => b.status === 'mda_approved').length,
    treasury_certified: bills.filter(b => b.status === 'treasury_certified').length,
  }), [bills]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Bills Explorer" 
        subtitle={`${filteredBills.length} bills • ${formatCurrency(totalAmount)}`} 
      />
      
      <div className="p-6 space-y-6">
        {/* Status Filters */}
        <div className="glass-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'all', label: 'All', icon: FileText },
              { key: 'submitted', label: 'Submitted', icon: FileText },
              { key: 'spv_offered', label: 'SPV Offered', icon: Briefcase },
              { key: 'offer_accepted', label: 'Offer Accepted', icon: CheckCircle },
              { key: 'mda_approved', label: 'MDA Approved', icon: Building2 },
              { key: 'treasury_certified', label: 'Certified', icon: Landmark },
            ].map(status => (
              <button
                key={status.key}
                onClick={() => setStatusFilter(status.key)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  statusFilter === status.key
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <status.icon className="w-4 h-4" />
                {status.label}
                <span className="ml-1 px-1.5 py-0.5 bg-background/50 rounded text-xs">
                  {statusCounts[status.key as keyof typeof statusCounts]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice, supplier, or description..."
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Bills Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">MDA</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No bills found</p>
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill) => (
                    <tr 
                      key={bill.id} 
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleViewBill(bill)}
                    >
                      <td className="px-4 py-4">
                        <p className="font-medium text-sm">{bill.invoice_number}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {bill.description || 'No description'}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {getProfileName(bill.supplier_id)}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {getMDAName(bill.mda_id)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-sm">
                        {formatCurrency(Number(bill.amount))}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                            getStatusColor(bill.status)
                          )}>
                            {getStatusIcon(bill.status)}
                            {formatStatus(bill.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {new Date(bill.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewBill(bill);
                            }}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bill Detail Modal */}
      <BillDetailModal
        bill={selectedBill}
        open={showDetailModal}
        onOpenChange={(open) => {
          setShowDetailModal(open);
          if (!open) setSelectedBill(null);
        }}
      />
    </div>
  );
};

export default AdminBillsPage;
