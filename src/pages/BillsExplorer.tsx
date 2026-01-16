import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import FilterPanel from '@/components/common/FilterPanel';
import DataTable from '@/components/common/DataTable';
import { mdaData, formatCurrency, getStatusColor, Bill } from '@/data/mockData';
import { useFilters } from '@/contexts/FilterContext';
import { useData } from '@/contexts/DataContext';
import { 
  CheckCircle, Clock, Loader2, XCircle, DollarSign, Eye, Download, X, FileText, 
  Check, Ban, CreditCard, RefreshCw, Upload, Printer, ChevronLeft, ChevronRight,
  ArrowUpDown, Search, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { exportBillsToCSV, generateBillsSummaryReport } from '@/lib/exportUtils';
import { DocumentModal } from '@/components/common/DocumentUpload';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusIcons = {
  verified: CheckCircle,
  pending: Clock,
  processing: Loader2,
  rejected: XCircle,
  paid: DollarSign,
};

const BillsExplorer = () => {
  const navigate = useNavigate();
  const { filters, setFilter } = useFilters();
  const { bills, verifyBill, processBill, payBill, rejectBill, bulkVerifyBills, getStats } = useData();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentBillId, setDocumentBillId] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Local search state
  const [localSearch, setLocalSearch] = useState('');

  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      // Local search
      if (localSearch) {
        const s = localSearch.toLowerCase();
        if (!bill.id.toLowerCase().includes(s) && 
            !bill.supplierName.toLowerCase().includes(s) && 
            !bill.mdaName.toLowerCase().includes(s) &&
            !bill.description.toLowerCase().includes(s)) return false;
      }
      // Global filters
      if (filters.searchTerm) {
        const s = filters.searchTerm.toLowerCase();
        if (!bill.id.toLowerCase().includes(s) && !bill.supplierName.toLowerCase().includes(s) && !bill.mdaName.toLowerCase().includes(s)) return false;
      }
      if (filters.status.length > 0 && !filters.status.includes(bill.status)) return false;
      if (filters.mdaIds.length > 0 && !filters.mdaIds.includes(bill.mdaId)) return false;
      if (filters.supplierIds.length > 0 && !filters.supplierIds.includes(bill.supplierId)) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(bill.category)) return false;
      if (filters.priority.length > 0 && !filters.priority.includes(bill.priority)) return false;
      return true;
    });
  }, [bills, filters, localSearch]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBills.length / pageSize);
  const paginatedBills = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredBills.slice(startIndex, startIndex + pageSize);
  }, [filteredBills, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [filters, localSearch]);

  const stats = getStats();

  const handleVerify = (bill: Bill) => {
    verifyBill(bill.id);
    toast.success(`Bill ${bill.id} verified successfully`);
    if (selectedBill?.id === bill.id) {
      setSelectedBill({ ...bill, status: 'verified', verificationDate: new Date().toISOString().split('T')[0] });
    }
  };

  const handleProcess = (bill: Bill) => {
    processBill(bill.id);
    toast.info(`Bill ${bill.id} moved to processing`);
    if (selectedBill?.id === bill.id) {
      setSelectedBill({ ...bill, status: 'processing' });
    }
  };

  const handlePay = (bill: Bill) => {
    payBill(bill.id);
    toast.success(`Payment for ${bill.id} completed`);
    if (selectedBill?.id === bill.id) {
      setSelectedBill({ ...bill, status: 'paid', paymentDate: new Date().toISOString().split('T')[0] });
    }
  };

  const handleReject = (bill: Bill) => {
    rejectBill(bill.id);
    toast.warning(`Bill ${bill.id} has been rejected`);
    if (selectedBill?.id === bill.id) {
      setSelectedBill({ ...bill, status: 'rejected' });
    }
  };

  const handleBulkVerify = () => {
    const pendingSelected = selectedBills.filter(id => {
      const bill = bills.find(b => b.id === id);
      return bill?.status === 'pending';
    });
    if (pendingSelected.length > 0) {
      bulkVerifyBills(pendingSelected);
      toast.success(`${pendingSelected.length} bills verified`);
      setSelectedBills([]);
    }
  };

  const handleBulkProcess = () => {
    const verifiedSelected = selectedBills.filter(id => {
      const bill = bills.find(b => b.id === id);
      return bill?.status === 'verified';
    });
    verifiedSelected.forEach(id => processBill(id));
    if (verifiedSelected.length > 0) {
      toast.info(`${verifiedSelected.length} bills moved to processing`);
      setSelectedBills([]);
    }
  };

  const handleBulkPay = () => {
    const payableSelected = selectedBills.filter(id => {
      const bill = bills.find(b => b.id === id);
      return bill?.status === 'verified' || bill?.status === 'processing';
    });
    payableSelected.forEach(id => payBill(id));
    if (payableSelected.length > 0) {
      toast.success(`${payableSelected.length} bills paid`);
      setSelectedBills([]);
    }
  };

  const toggleBillSelection = (billId: string) => {
    setSelectedBills(prev => 
      prev.includes(billId) 
        ? prev.filter(id => id !== billId)
        : [...prev, billId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedBills.length === paginatedBills.length) {
      setSelectedBills([]);
    } else {
      setSelectedBills(paginatedBills.map(b => b.id));
    }
  };

  const openDocuments = (billId: string) => {
    setDocumentBillId(billId);
    setShowDocumentModal(true);
  };

  const handleExportCSV = () => {
    exportBillsToCSV(filteredBills);
    toast.success(`Exported ${filteredBills.length} bills to CSV`);
  };

  const handlePrintReport = () => {
    generateBillsSummaryReport(filteredBills);
    toast.success('Report generated for printing');
  };

  const handleExportSelected = () => {
    const selected = bills.filter(b => selectedBills.includes(b.id));
    exportBillsToCSV(selected);
    toast.success(`Exported ${selected.length} selected bills to CSV`);
  };

  // Navigate to filtered view
  const navigateToStatus = (status: string) => {
    setFilter('status', [status]);
    setCurrentPage(1);
  };

  const columns = [
    {
      key: 'select',
      header: '',
      width: 'w-10',
      render: (bill: Bill) => (
        <input
          type="checkbox"
          checked={selectedBills.includes(bill.id)}
          onChange={(e) => {
            e.stopPropagation();
            toggleBillSelection(bill.id);
          }}
          className="w-4 h-4 rounded border-border cursor-pointer"
        />
      ),
    },
    {
      key: 'id',
      header: 'Bill ID',
      sortable: true,
      render: (bill: Bill) => <span className="font-mono text-xs font-medium text-foreground">{bill.id}</span>,
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      sortable: true,
      render: (bill: Bill) => (
        <div className="max-w-[160px]">
          <p className="text-sm font-medium text-foreground truncate">{bill.supplierName}</p>
          <p className="text-xs text-muted-foreground truncate">{bill.category}</p>
        </div>
      ),
    },
    {
      key: 'mdaName',
      header: 'MDA',
      sortable: true,
      render: (bill: Bill) => (
        <span 
          className="text-sm text-muted-foreground hover:text-primary cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/mdas');
          }}
        >
          {mdaData.find(m => m.id === bill.mdaId)?.shortName || bill.mdaName}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right' as const,
      render: (bill: Bill) => <span className="text-sm font-medium">{formatCurrency(bill.amount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (bill: Bill) => {
        const Icon = statusIcons[bill.status];
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(bill.status)}`}>
            <Icon className={`w-3 h-3 ${bill.status === 'processing' ? 'animate-spin' : ''}`} />
            {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (bill: Bill) => {
        const colors = { high: 'bg-destructive/10 text-destructive', medium: 'bg-warning/10 text-warning', low: 'bg-secondary text-muted-foreground' };
        return <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${colors[bill.priority]}`}>{bill.priority}</span>;
      },
    },
    {
      key: 'dueDate',
      header: 'Due',
      sortable: true,
      render: (bill: Bill) => <span className="text-xs text-muted-foreground">{bill.dueDate}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (bill: Bill) => (
        <div className="flex items-center gap-1">
          {bill.status === 'pending' && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleVerify(bill); }}
              className="p-1.5 hover:bg-success/10 rounded-md transition-colors"
              title="Verify"
            >
              <Check className="w-4 h-4 text-success" />
            </button>
          )}
          {bill.status === 'verified' && (
            <button 
              onClick={(e) => { e.stopPropagation(); handlePay(bill); }}
              className="p-1.5 hover:bg-accent/10 rounded-md transition-colors"
              title="Pay"
            >
              <CreditCard className="w-4 h-4 text-accent" />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); openDocuments(bill.id); }}
            className="p-1.5 hover:bg-secondary rounded-md transition-colors"
            title="Documents"
          >
            <Upload className="w-4 h-4 text-muted-foreground" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedBill(bill); }} 
            className="p-1.5 hover:bg-secondary rounded-md transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      ),
    },
  ];

  const totalAmount = filteredBills.reduce((sum, b) => sum + b.amount, 0);
  const selectedAmount = bills.filter(b => selectedBills.includes(b.id)).reduce((sum, b) => sum + b.amount, 0);

  // Get counts for bulk action buttons
  const selectedPendingCount = selectedBills.filter(id => bills.find(b => b.id === id)?.status === 'pending').length;
  const selectedVerifiedCount = selectedBills.filter(id => bills.find(b => b.id === id)?.status === 'verified').length;
  const selectedPayableCount = selectedBills.filter(id => {
    const bill = bills.find(b => b.id === id);
    return bill?.status === 'verified' || bill?.status === 'processing';
  }).length;

  return (
    <div className="min-h-screen">
      <TopBar title="Bills Explorer" subtitle={`${filteredBills.length} bills • ${formatCurrency(totalAmount)}`} />
      
      <div className="p-6">
        <div className="flex gap-6">
          <div className="w-52 shrink-0">
            <FilterPanel />
          </div>

          <div className="flex-1 space-y-4">
            {/* Bulk Actions Bar */}
            {selectedBills.length > 0 && (
              <div className="glass-card p-3 border-l-4 border-l-accent animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{selectedBills.length} bills selected</span>
                    <span className="text-xs text-muted-foreground">({formatCurrency(selectedAmount)})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedPendingCount > 0 && (
                      <button
                        onClick={handleBulkVerify}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success rounded-md text-sm font-medium hover:bg-success/20 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Verify ({selectedPendingCount})
                      </button>
                    )}
                    {selectedVerifiedCount > 0 && (
                      <button
                        onClick={handleBulkProcess}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium hover:bg-primary/20 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Process ({selectedVerifiedCount})
                      </button>
                    )}
                    {selectedPayableCount > 0 && (
                      <button
                        onClick={handleBulkPay}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent rounded-md text-sm font-medium hover:bg-accent/20 transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                        Pay ({selectedPayableCount})
                      </button>
                    )}
                    <button
                      onClick={handleExportSelected}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-muted-foreground rounded-md text-sm hover:bg-secondary/80 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button
                      onClick={() => setSelectedBills([])}
                      className="px-3 py-1.5 bg-secondary text-muted-foreground rounded-md text-sm hover:bg-secondary/80 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats Banner */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-secondary">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Bill Management</h3>
                    <p className="text-xs text-muted-foreground">Click rows to view details • Use checkboxes for bulk actions</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {[
                    { label: 'Pending', value: stats.pendingBills, color: 'text-warning', status: 'pending' },
                    { label: 'Verified', value: stats.verifiedBills, color: 'text-success', status: 'verified' },
                    { label: 'Processing', value: stats.processingBills, color: 'text-primary', status: 'processing' },
                    { label: 'Paid', value: stats.paidBills, color: 'text-accent', status: 'paid' },
                  ].map((s, i) => (
                    <div key={s.label} className="flex items-center gap-4">
                      {i > 0 && <div className="h-6 w-px bg-border" />}
                      <button 
                        onClick={() => navigateToStatus(s.status)}
                        className="text-center hover:opacity-70 transition-opacity"
                      >
                        <p className={cn("text-lg font-semibold", s.color)}>{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status Summary Cards */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { status: 'pending', icon: Clock, color: 'border-l-warning', bgColor: 'bg-warning/5' },
                { status: 'verified', icon: CheckCircle, color: 'border-l-success', bgColor: 'bg-success/5' },
                { status: 'processing', icon: Loader2, color: 'border-l-primary', bgColor: 'bg-primary/5' },
                { status: 'paid', icon: DollarSign, color: 'border-l-accent', bgColor: 'bg-accent/5' },
              ].map(({ status, icon: Icon, color, bgColor }) => {
                const count = filteredBills.filter(b => b.status === status).length;
                const amount = filteredBills.filter(b => b.status === status).reduce((sum, b) => sum + b.amount, 0);
                const isActive = filters.status.includes(status);
                return (
                  <button
                    key={status}
                    onClick={() => navigateToStatus(status)}
                    className={cn(
                      "glass-card p-3 border-l-4 text-left transition-all hover:shadow-md",
                      color,
                      isActive && bgColor
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn("p-1.5 rounded-md", isActive ? bgColor : "bg-secondary")}>
                        <Icon className={cn("w-3.5 h-3.5 text-muted-foreground", status === 'processing' && 'animate-spin')} />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground">{count}</p>
                        <p className="text-xs text-muted-foreground capitalize">{status}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(amount, true)}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-foreground">Bills Registry</h3>
                  
                  {/* Local Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      placeholder="Search bills..."
                      className="pl-8 pr-3 py-1.5 text-xs bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary w-48"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                  >
                    {selectedBills.length === paginatedBills.length ? 'Deselect All' : 'Select Page'}
                  </button>
                  <button 
                    onClick={() => {
                      const pendingBills = filteredBills.filter(b => b.status === 'pending').map(b => b.id);
                      setSelectedBills(pendingBills);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                  >
                    Select Pending
                  </button>
                  <button 
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    CSV
                  </button>
                  <button 
                    onClick={handlePrintReport}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>
                </div>
              </div>
              
              <DataTable 
                data={paginatedBills} 
                columns={columns} 
                keyExtractor={(bill) => bill.id} 
                onRowClick={(bill) => setSelectedBill(bill)} 
              />
              
              {/* Pagination */}
              <div className="p-3 border-t border-border bg-secondary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-muted-foreground">
                      Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredBills.length)} of {filteredBills.length} bills
                    </p>
                    <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                      <SelectTrigger className="w-20 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">per page</span>
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={cn(
                              "w-8 h-8 rounded-md text-xs font-medium transition-colors",
                              currentPage === pageNum 
                                ? "bg-primary text-primary-foreground" 
                                : "hover:bg-secondary"
                            )}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Modal */}
      {documentBillId && (
        <DocumentModal
          isOpen={showDocumentModal}
          onClose={() => { setShowDocumentModal(false); setDocumentBillId(null); }}
          entityType="bill"
          entityId={documentBillId}
          title={`Documents for ${documentBillId}`}
        />
      )}

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="font-semibold text-foreground">{selectedBill.id}</h2>
                <p className="text-xs text-muted-foreground">{selectedBill.description}</p>
              </div>
              <button onClick={() => setSelectedBill(null)} className="p-1.5 hover:bg-secondary rounded-md transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Supplier</p>
                  <p className="font-medium text-sm text-foreground">{selectedBill.supplierName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">MDA</p>
                  <p className="font-medium text-sm text-foreground">{selectedBill.mdaName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
                  <p className="font-bold text-lg text-foreground">{formatCurrency(selectedBill.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Due Date</p>
                  <p className="font-medium text-sm text-foreground">{selectedBill.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Category</p>
                  <p className="font-medium text-sm text-foreground">{selectedBill.category}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Priority</p>
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium capitalize", {
                    'bg-destructive/10 text-destructive': selectedBill.priority === 'high',
                    'bg-warning/10 text-warning': selectedBill.priority === 'medium',
                    'bg-secondary text-muted-foreground': selectedBill.priority === 'low',
                  })}>{selectedBill.priority}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground flex-1">Status:</p>
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium", getStatusColor(selectedBill.status))}>
                  {selectedBill.status.charAt(0).toUpperCase() + selectedBill.status.slice(1)}
                </span>
              </div>

              {selectedBill.verificationDate && (
                <div className="p-2.5 bg-success/10 rounded-md">
                  <p className="text-xs text-success font-medium">✓ Verified on {selectedBill.verificationDate}</p>
                </div>
              )}

              {selectedBill.paymentDate && (
                <div className="p-2.5 bg-accent/10 rounded-md">
                  <p className="text-xs text-accent font-medium">💰 Paid on {selectedBill.paymentDate}</p>
                </div>
              )}

              {/* Documents Section */}
              <div className="border-t border-border pt-3">
                <button
                  onClick={() => openDocuments(selectedBill.id)}
                  className="w-full flex items-center justify-between p-2.5 bg-secondary/50 rounded-md hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Manage Documents</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Action Buttons based on status */}
              <div className="flex gap-2 pt-2">
                {selectedBill.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleVerify(selectedBill)}
                      className="flex-1 px-4 py-2 bg-success text-success-foreground rounded-md text-sm font-medium hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Verify Bill
                    </button>
                    <button 
                      onClick={() => handleReject(selectedBill)}
                      className="px-4 py-2 bg-destructive/10 text-destructive rounded-md text-sm font-medium hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Ban className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}

                {selectedBill.status === 'verified' && (
                  <>
                    <button 
                      onClick={() => handleProcess(selectedBill)}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Process
                    </button>
                    <button 
                      onClick={() => handlePay(selectedBill)}
                      className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay Now
                    </button>
                  </>
                )}

                {selectedBill.status === 'processing' && (
                  <button 
                    onClick={() => handlePay(selectedBill)}
                    className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Complete Payment
                  </button>
                )}

                {(selectedBill.status === 'paid' || selectedBill.status === 'rejected') && (
                  <div className="flex-1 px-4 py-2 bg-secondary text-muted-foreground rounded-md text-sm font-medium text-center">
                    {selectedBill.status === 'paid' ? '✓ Payment Complete' : '✗ Bill Rejected'}
                  </div>
                )}

                <button 
                  onClick={() => setSelectedBill(null)}
                  className="px-4 py-2 bg-secondary border border-border rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillsExplorer;
