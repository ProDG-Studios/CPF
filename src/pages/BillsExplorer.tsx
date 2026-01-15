import { useState, useMemo } from 'react';
import TopBar from '@/components/layout/TopBar';
import FilterPanel from '@/components/common/FilterPanel';
import DataTable from '@/components/common/DataTable';
import { billsData, mdaData, formatCurrency, getStatusColor, Bill } from '@/data/mockData';
import { useFilters } from '@/contexts/FilterContext';
import { CheckCircle, Clock, Loader2, XCircle, DollarSign, Eye, Download, X, FileText } from 'lucide-react';

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
  }, [filters]);

  const columns = [
    {
      key: 'id',
      header: 'Bill ID',
      sortable: true,
      render: (bill: Bill) => <span className="font-mono text-xs text-accent font-medium">{bill.id}</span>,
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
        <button onClick={(e) => { e.stopPropagation(); setSelectedBill(bill); }} className="p-1.5 hover:bg-secondary rounded-md transition-colors">
          <Eye className="w-4 h-4 text-muted-foreground" />
        </button>
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
            {/* Banner */}
            <div className="glass-card p-4 border-l-2 border-l-accent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-accent/10">
                    <FileText className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Bill Verification</h3>
                    <p className="text-xs text-muted-foreground">Bills verified by MDA enter the securitization pool</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {[
                    { label: 'Awaiting', value: filteredBills.filter(b => b.status === 'pending').length, color: 'text-muted-foreground' },
                    { label: 'Verifying', value: filteredBills.filter(b => b.status === 'processing').length, color: 'text-warning' },
                    { label: 'Verified', value: filteredBills.filter(b => b.status === 'verified').length, color: 'text-success' },
                  ].map((s, i) => (
                    <div key={s.label} className="flex items-center gap-4">
                      {i > 0 && <div className="h-6 w-px bg-border" />}
                      <div className="text-center">
                        <p className={`text-lg font-semibold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-3">
              {['verified', 'processing', 'pending', 'paid'].map((status) => {
                const count = filteredBills.filter(b => b.status === status).length;
                const amount = filteredBills.filter(b => b.status === status).reduce((sum, b) => sum + b.amount, 0);
                const Icon = statusIcons[status as keyof typeof statusIcons];
                return (
                  <div key={status} className="glass-card p-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-md ${getStatusColor(status)}`}>
                        <Icon className="w-3.5 h-3.5" />
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
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
                  <Download className="w-3.5 h-3.5" />Export
                </button>
              </div>
              <DataTable data={filteredBills} columns={columns} keyExtractor={(bill) => bill.id} onRowClick={(bill) => setSelectedBill(bill)} />
              <div className="p-3 border-t border-border bg-secondary/30">
                <p className="text-xs text-muted-foreground text-center">Showing {filteredBills.length} of {billsData.length} bills</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
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
                {[
                  { label: 'Supplier', value: selectedBill.supplierName },
                  { label: 'MDA', value: selectedBill.mdaName },
                  { label: 'Amount', value: formatCurrency(selectedBill.amount), large: true },
                  { label: 'Due Date', value: selectedBill.dueDate },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                    <p className={`font-medium ${item.large ? 'text-lg' : 'text-sm'} text-foreground`}>{item.value}</p>
                  </div>
                ))}
              </div>
              {selectedBill.verificationDate && (
                <div className="p-2.5 bg-success/10 rounded-md">
                  <p className="text-xs text-success font-medium">✓ Verified on {selectedBill.verificationDate}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-colors">Process</button>
                <button className="px-4 py-2 bg-secondary border border-border rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors">Documents</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillsExplorer;
