import { useState, useMemo } from 'react';
import TopBar from '@/components/layout/TopBar';
import FilterPanel from '@/components/common/FilterPanel';
import DataTable from '@/components/common/DataTable';
import { billsData, mdaData, formatCurrency, getStatusColor, Bill } from '@/data/mockData';
import { useFilters } from '@/contexts/FilterContext';
import { 
  CheckCircle, 
  Clock, 
  Loader2, 
  XCircle, 
  DollarSign,
  Eye,
  Download,
  X,
  FileText
} from 'lucide-react';

const statusIcons = {
  verified: CheckCircle,
  pending: Clock,
  processing: Loader2,
  rejected: XCircle,
  paid: DollarSign,
};

const BillsExplorer = () => {
  const { filters } = useFilters();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const filteredBills = useMemo(() => {
    return billsData.filter(bill => {
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        const matches = 
          bill.id.toLowerCase().includes(search) ||
          bill.supplierName.toLowerCase().includes(search) ||
          bill.mdaName.toLowerCase().includes(search) ||
          bill.description.toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (filters.status.length > 0 && !filters.status.includes(bill.status)) {
        return false;
      }

      if (filters.mdaIds.length > 0 && !filters.mdaIds.includes(bill.mdaId)) {
        return false;
      }

      if (filters.supplierIds.length > 0 && !filters.supplierIds.includes(bill.supplierId)) {
        return false;
      }

      if (filters.categories.length > 0 && !filters.categories.includes(bill.category)) {
        return false;
      }

      if (filters.priority.length > 0 && !filters.priority.includes(bill.priority)) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const columns = [
    {
      key: 'id',
      header: 'Bill ID',
      sortable: true,
      render: (bill: Bill) => (
        <span className="font-mono text-xs text-accent font-medium">{bill.id}</span>
      ),
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      sortable: true,
      render: (bill: Bill) => (
        <div className="max-w-[180px]">
          <p className="text-sm font-medium text-foreground truncate">{bill.supplierName}</p>
          <p className="text-xs text-muted-foreground truncate">{bill.category}</p>
        </div>
      ),
    },
    {
      key: 'mdaName',
      header: 'MDA',
      sortable: true,
      render: (bill: Bill) => {
        const mda = mdaData.find(m => m.id === bill.mdaId);
        return (
          <span className="text-sm text-muted-foreground">{mda?.shortName || bill.mdaName}</span>
        );
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right' as const,
      render: (bill: Bill) => (
        <span className="text-sm font-semibold text-foreground">{formatCurrency(bill.amount)}</span>
      ),
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
        const priorityColors = {
          high: 'bg-destructive/10 text-destructive',
          medium: 'bg-warning/10 text-warning',
          low: 'bg-muted text-muted-foreground',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${priorityColors[bill.priority]}`}>
            {bill.priority}
          </span>
        );
      },
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (bill: Bill) => (
        <span className="text-xs text-muted-foreground">{bill.dueDate}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (bill: Bill) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedBill(bill);
          }}
          className="p-1.5 hover:bg-muted rounded transition-colors"
        >
          <Eye className="w-4 h-4 text-muted-foreground" />
        </button>
      ),
    },
  ];

  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <TopBar 
        title="Bills Explorer" 
        subtitle={`${filteredBills.length} bills • ${formatCurrency(totalAmount)}`}
      />
      
      <div className="p-6">
        <div className="flex gap-6">
          {/* Filter Panel */}
          <div className="w-56 shrink-0">
            <FilterPanel />
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-4">
            {/* Verification Banner */}
            <div className="glass-card p-4 border-l-2 border-l-accent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-accent/10">
                    <FileText className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Bill Verification Process</h3>
                    <p className="text-xs text-muted-foreground">
                      Bills must be verified by MDA before entering the securitization pool
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-sm">
                  <div className="text-center">
                    <p className="text-xl font-bold text-muted-foreground">{filteredBills.filter(b => b.status === 'pending').length}</p>
                    <p className="text-xs text-muted-foreground">Awaiting</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-xl font-bold text-warning">{filteredBills.filter(b => b.status === 'processing').length}</p>
                    <p className="text-xs text-muted-foreground">Verifying</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-xl font-bold text-success">{filteredBills.filter(b => b.status === 'verified').length}</p>
                    <p className="text-xs text-muted-foreground">Verified</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3">
              {['verified', 'processing', 'pending', 'paid'].map((status) => {
                const count = filteredBills.filter(b => b.status === status).length;
                const amount = filteredBills
                  .filter(b => b.status === status)
                  .reduce((sum, b) => sum + b.amount, 0);
                const Icon = statusIcons[status as keyof typeof statusIcons];
                
                return (
                  <div key={status} className="glass-card p-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded ${getStatusColor(status)}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{count}</p>
                        <p className="text-xs text-muted-foreground capitalize">{status}</p>
                        <p className="text-xs font-medium text-muted-foreground">{formatCurrency(amount, true)}</p>
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
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
              </div>
              <DataTable
                data={filteredBills}
                columns={columns}
                keyExtractor={(bill) => bill.id}
                onRowClick={(bill) => setSelectedBill(bill)}
              />
              <div className="p-3 border-t border-border bg-muted/30">
                <p className="text-xs text-muted-foreground text-center">
                  Showing {filteredBills.length} of {billsData.length} bills
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-xl w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="font-semibold text-lg text-foreground">{selectedBill.id}</h2>
                <p className="text-xs text-muted-foreground">{selectedBill.description}</p>
              </div>
              <button 
                onClick={() => setSelectedBill(null)}
                className="p-1.5 hover:bg-muted rounded transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Supplier</p>
                  <p className="text-sm font-medium text-foreground">{selectedBill.supplierName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">MDA</p>
                  <p className="text-sm font-medium text-foreground">{selectedBill.mdaName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Amount</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(selectedBill.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedBill.status)}`}>
                    {selectedBill.status.charAt(0).toUpperCase() + selectedBill.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Invoice Date</p>
                  <p className="text-sm font-medium text-foreground">{selectedBill.invoiceDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                  <p className="text-sm font-medium text-foreground">{selectedBill.dueDate}</p>
                </div>
              </div>

              {selectedBill.verificationDate && (
                <div className="p-3 bg-success/10 border border-success/20 rounded">
                  <p className="text-xs text-success font-medium">
                    ✓ Verified on {selectedBill.verificationDate}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors">
                  Process Bill
                </button>
                <button className="px-4 py-2 bg-muted border border-border rounded text-sm font-medium hover:bg-muted/80 transition-colors">
                  View Documents
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
