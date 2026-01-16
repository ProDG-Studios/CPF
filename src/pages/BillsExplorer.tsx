import { useState, useMemo } from 'react';
import TopBar from '@/components/layout/TopBar';
import FilterPanel from '@/components/common/FilterPanel';
import DataTable from '@/components/common/DataTable';
import { mdaData, formatCurrency, getStatusColor, Bill } from '@/data/mockData';
import { useFilters } from '@/contexts/FilterContext';
import { useData } from '@/contexts/DataContext';
import { CheckCircle, Clock, Loader2, XCircle, DollarSign, Eye, Download, X, FileText, Check, Ban, CreditCard, ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusIcons = {
  verified: CheckCircle,
  pending: Clock,
  processing: Loader2,
  rejected: XCircle,
  paid: DollarSign,
};

const BillsExplorer = () => {
  const { filters } = useFilters();
  const { bills, verifyBill, processBill, payBill, rejectBill, bulkVerifyBills, getStats } = useData();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
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
  }, [bills, filters]);

  const stats = getStats();

  const handleVerify = (bill: Bill) => {
    verifyBill(bill.id);
    toast.success(`Bill ${bill.id} verified successfully`);
    // Update the selectedBill if it's the same bill
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
      setShowBulkActions(false);
    }
  };

  const toggleBillSelection = (billId: string) => {
    setSelectedBills(prev => 
      prev.includes(billId) 
        ? prev.filter(id => id !== billId)
        : [...prev, billId]
    );
  };

  const columns = [
    {
      key: 'select',
      header: '',
      width: '40px',
      render: (bill: Bill) => (
        <input
          type="checkbox"
          checked={selectedBills.includes(bill.id)}
          onChange={(e) => {
            e.stopPropagation();
            toggleBillSelection(bill.id);
          }}
          className="w-4 h-4 rounded border-border"
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
      render: (bill: Bill) => <span className="text-sm text-muted-foreground">{mdaData.find(m => m.id === bill.mdaId)?.shortName || bill.mdaName}</span>,
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
              <div className="glass-card p-3 border-l-4 border-l-accent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{selectedBills.length} bills selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBulkVerify}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success rounded-md text-sm font-medium hover:bg-success/20 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Verify Selected
                    </button>
                    <button
                      onClick={() => setSelectedBills([])}
                      className="px-3 py-1.5 bg-secondary text-muted-foreground rounded-md text-sm hover:bg-secondary/80 transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Banner */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-secondary">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Bill Verification</h3>
                    <p className="text-xs text-muted-foreground">Click ✓ to verify pending bills, or select multiple for bulk actions</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {[
                    { label: 'Awaiting', value: stats.pendingBills, color: 'text-warning' },
                    { label: 'Verifying', value: stats.processingBills, color: 'text-primary' },
                    { label: 'Verified', value: stats.verifiedBills, color: 'text-success' },
                    { label: 'Paid', value: stats.paidBills, color: 'text-accent' },
                  ].map((s, i) => (
                    <div key={s.label} className="flex items-center gap-4">
                      {i > 0 && <div className="h-6 w-px bg-border" />}
                      <div className="text-center">
                        <p className={cn("text-lg font-semibold", s.color)}>{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { status: 'verified', icon: CheckCircle, color: 'border-l-success' },
                { status: 'processing', icon: Loader2, color: 'border-l-primary' },
                { status: 'pending', icon: Clock, color: 'border-l-warning' },
                { status: 'paid', icon: DollarSign, color: 'border-l-accent' },
              ].map(({ status, icon: Icon, color }) => {
                const count = filteredBills.filter(b => b.status === status).length;
                const amount = filteredBills.filter(b => b.status === status).reduce((sum, b) => sum + b.amount, 0);
                return (
                  <div key={status} className={cn("glass-card p-3 border-l-4", color)}>
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-secondary">
                        <Icon className={cn("w-3.5 h-3.5 text-muted-foreground", status === 'processing' && 'animate-spin')} />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground">{count}</p>
                        <p className="text-xs text-muted-foreground capitalize">{status}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(amount, true)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Bills Registry</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const pendingBills = filteredBills.filter(b => b.status === 'pending').map(b => b.id);
                      setSelectedBills(pendingBills);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                  >
                    Select Pending
                  </button>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
                    <Download className="w-3.5 h-3.5" />Export
                  </button>
                </div>
              </div>
              <DataTable data={filteredBills} columns={columns} keyExtractor={(bill) => bill.id} onRowClick={(bill) => setSelectedBill(bill)} />
              <div className="p-3 border-t border-border bg-secondary/30">
                <p className="text-xs text-muted-foreground text-center">Showing {filteredBills.length} of {bills.length} bills</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto">
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
                  <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                  <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium", getStatusColor(selectedBill.status))}>
                    {selectedBill.status.charAt(0).toUpperCase() + selectedBill.status.slice(1)}
                  </span>
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

              {/* Action Buttons based on status */}
              <div className="flex gap-2">
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
                    {selectedBill.status === 'paid' ? 'Payment Complete' : 'Bill Rejected'}
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
