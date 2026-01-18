import { useState, useMemo } from 'react';
import TopBar from '@/components/layout/TopBar';
import BillDetailModal from '@/components/bills/BillDetailModal';
import { 
  FileText, 
  Search, 
  Eye,
  Download,
  CheckCircle,
  Clock,
  Briefcase,
  Building2,
  Landmark,
  Filter,
  ArrowUpDown,
  Package,
  Wrench,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { comprehensiveBills, formatKES, formatFullKES } from '@/data/adminMockData';
import { format } from 'date-fns';

const AdminBillsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [mdaFilter, setMdaFilter] = useState<string>('all');
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const uniqueMDAs = [...new Set(comprehensiveBills.map(b => b.mda))];

  const filteredBills = useMemo(() => {
    return comprehensiveBills
      .filter(bill => {
        const matchesSearch = 
          bill.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bill.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bill.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
        const matchesType = typeFilter === 'all' || bill.bill_type === typeFilter;
        const matchesMDA = mdaFilter === 'all' || bill.mda === mdaFilter;
        
        return matchesSearch && matchesStatus && matchesType && matchesMDA;
      })
      .sort((a, b) => {
        if (sortField === 'amount') {
          return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        }
        if (sortField === 'created_at') {
          return sortDirection === 'asc' 
            ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      });
  }, [searchTerm, statusFilter, typeFilter, mdaFilter, sortField, sortDirection]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'under_review': return <FileText className="w-3.5 h-3.5" />;
      case 'offer_made':
      case 'offer_accepted': return <Briefcase className="w-3.5 h-3.5" />;
      case 'mda_reviewing':
      case 'mda_approved':
      case 'terms_set': return <Building2 className="w-3.5 h-3.5" />;
      case 'treasury_reviewing':
      case 'certified': return <Landmark className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'under_review': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'offer_made':
      case 'offer_accepted': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'mda_reviewing':
      case 'mda_approved':
      case 'terms_set': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'treasury_reviewing': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'certified': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Goods': return <Package className="w-3.5 h-3.5" />;
      case 'Services': return <Briefcase className="w-3.5 h-3.5" />;
      case 'Works': return <Wrench className="w-3.5 h-3.5" />;
      case 'Mixed': return <Layers className="w-3.5 h-3.5" />;
      default: return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const formatStatus = (status: string) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  const handleViewBill = (bill: any) => {
    setSelectedBill({
      ...bill,
      invoice_number: bill.invoice_number,
      amount: bill.amount,
      offer_amount: bill.offer_amount,
      offer_discount_rate: bill.discount_rate,
      status: bill.status,
      mda: { name: bill.mda },
      supplier: { company_name: bill.supplier },
      spv: bill.spv ? { spv_name: bill.spv } : null,
    });
    setShowDetailModal(true);
  };

  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Supplier', 'MDA', 'Type', 'Amount', 'Status', 'Created Date'];
    const rows = filteredBills.map(bill => [
      bill.invoice_number,
      bill.supplier,
      bill.mda,
      bill.bill_type,
      bill.amount,
      bill.status,
      format(new Date(bill.created_at), 'yyyy-MM-dd'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bills-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Bills exported to CSV');
  };

  const totalValue = filteredBills.reduce((sum, b) => sum + b.amount, 0);

  const statusCounts = useMemo(() => ({
    all: comprehensiveBills.length,
    submitted: comprehensiveBills.filter(b => b.status === 'submitted' || b.status === 'under_review').length,
    offered: comprehensiveBills.filter(b => b.status === 'offer_made' || b.status === 'offer_accepted').length,
    mda: comprehensiveBills.filter(b => ['mda_reviewing', 'mda_approved', 'terms_set'].includes(b.status)).length,
    certified: comprehensiveBills.filter(b => b.status === 'certified').length,
  }), []);

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Bills Explorer" 
        subtitle={`${filteredBills.length} bills • ${formatKES(totalValue)}`} 
      />
      
      <div className="p-6 space-y-6">
        {/* Status Quick Filters */}
        <div className="glass-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'all', label: 'All Bills', icon: FileText, count: statusCounts.all },
              { key: 'submitted', label: 'Submitted', icon: FileText, count: statusCounts.submitted },
              { key: 'offered', label: 'SPV Stage', icon: Briefcase, count: statusCounts.offered },
              { key: 'mda', label: 'MDA Stage', icon: Building2, count: statusCounts.mda },
              { key: 'certified', label: 'Certified', icon: CheckCircle, count: statusCounts.certified },
            ].map(status => (
              <button
                key={status.key}
                onClick={() => setStatusFilter(status.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  statusFilter === status.key
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <status.icon className="w-4 h-4" />
                {status.label}
                <Badge variant="secondary" className="ml-1 text-xs">{status.count}</Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice, supplier, or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Bill Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Goods">Goods</SelectItem>
                <SelectItem value="Services">Services</SelectItem>
                <SelectItem value="Works">Works</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={mdaFilter} onValueChange={setMdaFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by MDA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All MDAs</SelectItem>
                {uniqueMDAs.map(mda => (
                  <SelectItem key={mda} value={mda}>{mda}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
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
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase cursor-pointer hover:text-foreground" onClick={() => { setSortField('amount'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                    <div className="flex items-center justify-end gap-1">
                      Amount <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">SPV</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase cursor-pointer hover:text-foreground" onClick={() => { setSortField('created_at'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                    <div className="flex items-center gap-1">
                      Date <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
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
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {bill.description}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        {bill.supplier}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {bill.mda}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            {getTypeIcon(bill.bill_type)}
                            {bill.bill_type}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <p className="font-semibold text-sm">{formatFullKES(bill.amount)}</p>
                        {bill.offer_amount && (
                          <p className="text-xs text-accent">{formatFullKES(bill.offer_amount)} ({bill.discount_rate}%)</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center text-sm">
                        {bill.spv ? (
                          <span className="text-purple-600 font-medium">{bill.spv.split(' ')[0]}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                            getStatusColor(bill.status)
                          )}>
                            {getStatusIcon(bill.status)}
                            {formatStatus(bill.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {format(new Date(bill.created_at), 'MMM d, yyyy')}
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
