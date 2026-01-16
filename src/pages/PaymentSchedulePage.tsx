import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import { formatCurrency, PaymentSchedule } from '@/data/mockData';
import { useData } from '@/contexts/DataContext';
import { useFilters } from '@/contexts/FilterContext';
import { 
  CheckCircle, 
  Clock, 
  Calendar,
  Building,
  TrendingUp,
  ChevronRight,
  FileText,
  CreditCard,
  Download,
  Printer,
  Search,
  AlertCircle,
  ArrowRight,
  Eye,
  X,
  RefreshCw,
  DollarSign,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const PaymentSchedulePage = () => {
  const navigate = useNavigate();
  const { paymentSchedules, makePayment, bills } = useData();
  const { setFilter } = useFilters();
  const [selectedSchedule, setSelectedSchedule] = useState<PaymentSchedule | null>(paymentSchedules[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'due' | 'upcoming' | 'paid'>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [expandedQuarters, setExpandedQuarters] = useState<string[]>([]);

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    return paymentSchedules.filter(schedule => {
      if (searchTerm && !schedule.mdaName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filterStatus === 'due') {
        return schedule.quarterlyPayments.some(p => p.status === 'due');
      }
      if (filterStatus === 'paid') {
        return schedule.quarterlyPayments.every(p => p.status === 'paid');
      }
      if (filterStatus === 'upcoming') {
        return schedule.quarterlyPayments.some(p => p.status === 'upcoming');
      }
      return true;
    });
  }, [paymentSchedules, searchTerm, filterStatus]);

  const totalCommitted = paymentSchedules.reduce((sum, s) => sum + s.totalCommitted, 0);
  const totalPaid = paymentSchedules.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalRemaining = totalCommitted - totalPaid;
  const overallProgress = totalCommitted > 0 ? (totalPaid / totalCommitted) * 100 : 0;

  // Count due payments
  const duePaymentsCount = paymentSchedules.reduce((count, s) => 
    count + s.quarterlyPayments.filter(p => p.status === 'due').length, 0
  );
  const duePaymentsAmount = paymentSchedules.reduce((sum, s) => 
    sum + s.quarterlyPayments.filter(p => p.status === 'due').reduce((a, p) => a + p.amount, 0), 0
  );

  const getQuarterStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'due':
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return <Calendar className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getQuarterStatusClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 border-success/30 text-success';
      case 'due':
        return 'bg-warning/10 border-warning/30 text-warning';
      default:
        return 'bg-muted border-border text-muted-foreground';
    }
  };

  const handleMakePayment = (scheduleId: string, quarterIndex: number) => {
    const schedule = paymentSchedules.find(s => s.id === scheduleId);
    if (!schedule) return;

    const payment = schedule.quarterlyPayments[quarterIndex];
    if (payment.status === 'paid') {
      toast.info('This payment has already been made');
      return;
    }
    if (payment.status === 'upcoming') {
      toast.warning('This payment is not yet due');
      return;
    }

    makePayment(scheduleId, quarterIndex);
    toast.success(`${payment.quarter} payment of ${formatCurrency(payment.amount, true)} recorded`);
    
    // Update selected schedule view
    if (selectedSchedule?.id === scheduleId) {
      const updatedPayments = [...selectedSchedule.quarterlyPayments];
      updatedPayments[quarterIndex] = { 
        ...updatedPayments[quarterIndex], 
        status: 'paid' as const, 
        paidDate: new Date().toISOString().split('T')[0] 
      };
      setSelectedSchedule({
        ...selectedSchedule,
        quarterlyPayments: updatedPayments,
        totalPaid: selectedSchedule.totalPaid + payment.amount,
      });
    }
  };

  const handlePayAllDue = () => {
    let paidCount = 0;
    paymentSchedules.forEach(schedule => {
      schedule.quarterlyPayments.forEach((payment, index) => {
        if (payment.status === 'due') {
          makePayment(schedule.id, index);
          paidCount++;
        }
      });
    });
    if (paidCount > 0) {
      toast.success(`${paidCount} due payments recorded`);
    } else {
      toast.info('No due payments to process');
    }
  };

  const handleExportCSV = () => {
    const rows: Record<string, string>[] = [];
    
    paymentSchedules.forEach(schedule => {
      schedule.quarterlyPayments.forEach(payment => {
        rows.push({
          'MDA': schedule.mdaName,
          'Fiscal Year': schedule.fiscalYear,
          'Quarter': payment.quarter,
          'Amount': payment.amount.toString(),
          'Due Date': payment.dueDate,
          'Status': payment.status,
          'Paid Date': payment.paidDate || '',
        });
      });
    });

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-schedules-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Payment schedules exported to CSV');
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MDA Payment Schedules Report</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 40px; max-width: 1000px; margin: 0 auto; }
          h1 { font-size: 24px; margin-bottom: 8px; }
          .subtitle { color: #666; margin-bottom: 24px; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
          .summary-card { background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center; }
          .summary-value { font-size: 20px; font-weight: bold; margin-bottom: 4px; }
          .summary-label { font-size: 12px; color: #666; }
          .mda-section { margin-bottom: 24px; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; }
          .mda-header { background: #f9fafb; padding: 16px; border-bottom: 1px solid #e5e5e5; }
          .mda-title { font-weight: 600; margin-bottom: 4px; }
          .mda-subtitle { font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; }
          th { background: #f9fafb; font-weight: 600; font-size: 12px; text-transform: uppercase; }
          .status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
          .status-paid { background: #dcfce7; color: #16a34a; }
          .status-due { background: #fef3c7; color: #d97706; }
          .status-upcoming { background: #f3f4f6; color: #6b7280; }
          .amount { font-weight: 600; }
          .progress-bar { height: 8px; background: #e5e5e5; border-radius: 4px; overflow: hidden; margin: 8px 0; }
          .progress-fill { height: 100%; background: #22c55e; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>MDA Payment Schedules Report</h1>
        <p class="subtitle">Generated on ${new Date().toLocaleDateString()} | Fiscal Year 2024/25</p>
        
        <div class="summary">
          <div class="summary-card">
            <div class="summary-value">${paymentSchedules.length}</div>
            <div class="summary-label">MDAs</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">${formatCurrency(totalCommitted, true)}</div>
            <div class="summary-label">Total Committed</div>
          </div>
          <div class="summary-card">
            <div class="summary-value" style="color: #16a34a;">${formatCurrency(totalPaid, true)}</div>
            <div class="summary-label">Total Paid</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">${overallProgress.toFixed(1)}%</div>
            <div class="summary-label">Collection Rate</div>
          </div>
        </div>
        
        ${paymentSchedules.map(schedule => {
          const progress = (schedule.totalPaid / schedule.totalCommitted) * 100;
          return `
            <div class="mda-section">
              <div class="mda-header">
                <div class="mda-title">${schedule.mdaName}</div>
                <div class="mda-subtitle">Committed: ${formatCurrency(schedule.totalCommitted)} | Paid: ${formatCurrency(schedule.totalPaid)} (${progress.toFixed(0)}%)</div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Quarter</th>
                    <th>Due Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Paid Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${schedule.quarterlyPayments.map(p => `
                    <tr>
                      <td>${p.quarter}</td>
                      <td>${p.dueDate}</td>
                      <td class="amount">${formatCurrency(p.amount)}</td>
                      <td><span class="status status-${p.status}">${p.status.toUpperCase()}</span></td>
                      <td>${p.paidDate || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;
        }).join('')}
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    toast.success('Print dialog opened');
  };

  const navigateToMDABills = (mdaId: string) => {
    setFilter('mdaIds', [mdaId]);
    navigate('/bills');
  };

  const toggleQuarterExpanded = (quarterId: string) => {
    setExpandedQuarters(prev => 
      prev.includes(quarterId) 
        ? prev.filter(q => q !== quarterId) 
        : [...prev, quarterId]
    );
  };

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Payment Schedules" 
        subtitle={`${paymentSchedules.length} MDAs • ${formatCurrency(totalCommitted, true)} committed`}
      />
      
      <div className="p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{paymentSchedules.length}</p>
                <p className="text-xs text-muted-foreground">Active MDAs</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xl font-bold text-accent">{formatCurrency(totalCommitted, true)}</p>
                <p className="text-xs text-muted-foreground">Total Committed</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold text-success">{formatCurrency(totalPaid, true)}</p>
                <p className="text-xs text-muted-foreground">Total Collected</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xl font-bold text-warning">{formatCurrency(duePaymentsAmount, true)}</p>
                <p className="text-xs text-muted-foreground">{duePaymentsCount} Due Payments</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <TrendingUp className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{overallProgress.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Collection Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress & Actions */}
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-foreground">Treasury Repayment Progress</h2>
              <p className="text-xs text-muted-foreground">Track MDA budget allocations servicing the securitized debt</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                onClick={handlePrintReport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Report
              </button>
              {duePaymentsCount > 0 && (
                <button
                  onClick={handlePayAllDue}
                  className="flex items-center gap-1.5 px-4 py-2 bg-success text-success-foreground rounded-md text-sm font-medium hover:bg-success/90 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  Record All Due ({duePaymentsCount})
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>{formatCurrency(totalPaid)} collected ({overallProgress.toFixed(1)}%)</span>
              <span>{formatCurrency(totalRemaining)} remaining</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search MDAs..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-1 p-1 bg-secondary rounded-md">
              {(['all', 'due', 'upcoming', 'paid'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    "px-3 py-1 text-xs rounded transition-colors capitalize",
                    filterStatus === status ? "bg-card shadow-sm" : "hover:bg-card/50"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MDA List */}
          <div className="lg:col-span-1">
            <div className="glass-card overflow-hidden">
              <div className="p-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold">MDA Payment Plans ({filteredSchedules.length})</h3>
              </div>
              <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {filteredSchedules.map((schedule) => {
                  const progress = (schedule.totalPaid / schedule.totalCommitted) * 100;
                  const hasDuePayments = schedule.quarterlyPayments.some(p => p.status === 'due');
                  const dueCount = schedule.quarterlyPayments.filter(p => p.status === 'due').length;
                  
                  return (
                    <div
                      key={schedule.id}
                      onClick={() => setSelectedSchedule(schedule)}
                      className={cn(
                        "p-3 cursor-pointer transition-all hover:bg-muted/30 relative",
                        selectedSchedule?.id === schedule.id && "bg-primary/5 border-l-4 border-l-primary"
                      )}
                    >
                      {hasDuePayments && (
                        <div className="absolute top-2 right-2">
                          <span className="px-1.5 py-0.5 bg-warning/20 text-warning text-xs rounded-full font-medium">
                            {dueCount} Due
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-foreground truncate pr-12">{schedule.mdaName}</p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Committed:</span>
                          <span className="font-medium text-accent">{formatCurrency(schedule.totalCommitted, true)}</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{progress.toFixed(0)}% collected</span>
                          <span>{schedule.fiscalYear}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Payment Schedule Details */}
          <div className="lg:col-span-2">
            {selectedSchedule ? (
              <div className="space-y-4">
                <div className="glass-card p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="font-semibold text-foreground">{selectedSchedule.mdaName}</h2>
                      <p className="text-xs text-muted-foreground">Payment Schedule - {selectedSchedule.fiscalYear}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateToMDABills(selectedSchedule.mdaId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Bills
                      </button>
                      <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-0.5">Committed</p>
                      <p className="text-lg font-bold text-accent">{formatCurrency(selectedSchedule.totalCommitted, true)}</p>
                    </div>
                    <div className="p-3 bg-success/10 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-0.5">Collected</p>
                      <p className="text-lg font-bold text-success">{formatCurrency(selectedSchedule.totalPaid, true)}</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="text-xs text-muted-foreground mb-0.5">Remaining</p>
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(selectedSchedule.totalCommitted - selectedSchedule.totalPaid, true)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Repayment Progress</span>
                      <span className="font-medium">
                        {((selectedSchedule.totalPaid / selectedSchedule.totalCommitted) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={(selectedSchedule.totalPaid / selectedSchedule.totalCommitted) * 100} className="h-2" />
                  </div>
                </div>

                {/* Quarterly Breakdown */}
                <div className="glass-card overflow-hidden">
                  <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
                    <h3 className="text-sm font-semibold">Quarterly Payment Schedule</h3>
                    <div className="flex items-center gap-1.5">
                      {selectedSchedule.quarterlyPayments.some(p => p.status === 'due') && (
                        <button
                          onClick={() => {
                            selectedSchedule.quarterlyPayments.forEach((p, i) => {
                              if (p.status === 'due') {
                                handleMakePayment(selectedSchedule.id, i);
                              }
                            });
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 bg-success/10 text-success rounded text-xs font-medium hover:bg-success/20 transition-colors"
                        >
                          <CreditCard className="w-3 h-3" />
                          Pay All Due
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="divide-y divide-border">
                    {selectedSchedule.quarterlyPayments.map((payment, index) => {
                      const quarterId = `${selectedSchedule.id}-${index}`;
                      const isExpanded = expandedQuarters.includes(quarterId);
                      
                      return (
                        <div key={index} className="transition-colors hover:bg-muted/20">
                          <div className="p-3 flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-full shrink-0",
                              payment.status === 'paid' ? 'bg-success/10' :
                              payment.status === 'due' ? 'bg-warning/10' : 'bg-muted'
                            )}>
                              {getQuarterStatusIcon(payment.status)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground">{payment.quarter}</p>
                                <span className={cn(
                                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border",
                                  getQuarterStatusClass(payment.status)
                                )}>
                                  {payment.status === 'paid' ? 'Paid' : 
                                   payment.status === 'due' ? 'Due Now' : 'Upcoming'}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">Due: {payment.dueDate}</p>
                            </div>

                            <div className="text-right">
                              <p className="font-bold text-foreground">{formatCurrency(payment.amount)}</p>
                              {payment.paidDate && (
                                <p className="text-xs text-success">Paid {payment.paidDate}</p>
                              )}
                            </div>

                            {payment.status === 'due' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMakePayment(selectedSchedule.id, index);
                                }}
                                className="px-3 py-1.5 bg-success text-success-foreground rounded-md text-xs font-medium hover:bg-success/90 transition-colors flex items-center gap-1"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                Record
                              </button>
                            )}

                            {payment.status === 'paid' && (
                              <div className="w-20 text-center">
                                <CheckCircle className="w-5 h-5 text-success mx-auto" />
                              </div>
                            )}

                            {payment.status === 'upcoming' && (
                              <div className="w-20 text-center">
                                <Calendar className="w-5 h-5 text-muted-foreground mx-auto" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Flow Diagram */}
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold mb-4">Payment Flow Structure</h3>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 text-center p-3 bg-primary/10 rounded-lg">
                      <Building className="w-6 h-6 mx-auto mb-1.5 text-primary" />
                      <p className="text-xs font-medium">MDA Budget</p>
                      <p className="text-xs text-muted-foreground">Vote Allocation</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 text-center p-3 bg-accent/10 rounded-lg">
                      <DollarSign className="w-6 h-6 mx-auto mb-1.5 text-accent" />
                      <p className="text-xs font-medium">Treasury</p>
                      <p className="text-xs text-muted-foreground">Fiscal Agent</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 text-center p-3 bg-success/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 mx-auto mb-1.5 text-success" />
                      <p className="text-xs font-medium">SPV</p>
                      <p className="text-xs text-muted-foreground">Bond Servicing</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 text-center p-3 bg-secondary rounded-lg">
                      <CheckCircle className="w-6 h-6 mx-auto mb-1.5 text-foreground" />
                      <p className="text-xs font-medium">Investors</p>
                      <p className="text-xs text-muted-foreground">Returns</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Select an MDA to view payment schedule</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSchedulePage;
