import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { formatCurrency, PaymentSchedule } from '@/data/mockData';
import { useData } from '@/contexts/DataContext';
import { 
  CheckCircle, 
  Clock, 
  Calendar,
  Building,
  TrendingUp,
  ChevronRight,
  FileText,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const PaymentSchedulePage = () => {
  const { paymentSchedules, makePayment } = useData();
  const [selectedSchedule, setSelectedSchedule] = useState<PaymentSchedule | null>(paymentSchedules[0]);

  const totalCommitted = paymentSchedules.reduce((sum, s) => sum + s.totalCommitted, 0);
  const totalPaid = paymentSchedules.reduce((sum, s) => sum + s.totalPaid, 0);
  const overallProgress = (totalPaid / totalCommitted) * 100;

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

  return (
    <div className="min-h-screen">
      <TopBar 
        title="MDA Payment Schedules" 
        subtitle="Treasury repayment commitments to SPV"
      />
      
      <div className="p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{paymentSchedules.length}</p>
                <p className="text-sm text-muted-foreground">MDAs with Schedules</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{formatCurrency(totalCommitted, true)}</p>
                <p className="text-sm text-muted-foreground">Total Committed</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{formatCurrency(totalPaid, true)}</p>
                <p className="text-sm text-muted-foreground">Total Paid</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <TrendingUp className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{overallProgress.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold">Overall Repayment Progress</h2>
            <span className="text-sm text-muted-foreground">FY 2024/25</span>
          </div>
          <Progress value={overallProgress} className="h-4 mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatCurrency(totalPaid)} collected</span>
            <span>{formatCurrency(totalCommitted - totalPaid)} remaining</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MDA List */}
          <div className="lg:col-span-1">
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h3 className="font-semibold">MDA Payment Plans</h3>
              </div>
              <div className="divide-y divide-border">
                {paymentSchedules.map((schedule) => {
                  const progress = (schedule.totalPaid / schedule.totalCommitted) * 100;
                  const hasDuePayments = schedule.quarterlyPayments.some(p => p.status === 'due');
                  return (
                    <div
                      key={schedule.id}
                      onClick={() => setSelectedSchedule(schedule)}
                      className={cn(
                        "p-4 cursor-pointer transition-all hover:bg-muted/30 relative",
                        selectedSchedule?.id === schedule.id && "bg-primary/10 border-l-4 border-primary"
                      )}
                    >
                      {hasDuePayments && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs rounded-full font-medium">Due</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground truncate pr-8">{schedule.mdaName}</p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Committed:</span>
                          <span className="font-medium text-accent">{formatCurrency(schedule.totalCommitted, true)}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{progress.toFixed(0)}% paid</span>
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
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">
                        {selectedSchedule.mdaName}
                      </h2>
                      <p className="text-muted-foreground">Payment Schedule - {selectedSchedule.fiscalYear}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Commitment</p>
                      <p className="text-2xl font-bold text-accent">{formatCurrency(selectedSchedule.totalCommitted)}</p>
                    </div>
                    <div className="p-4 bg-success/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Amount Paid</p>
                      <p className="text-2xl font-bold text-success">{formatCurrency(selectedSchedule.totalPaid)}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Repayment Progress</span>
                      <span className="font-medium">{((selectedSchedule.totalPaid / selectedSchedule.totalCommitted) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(selectedSchedule.totalPaid / selectedSchedule.totalCommitted) * 100} className="h-3" />
                  </div>
                </div>

                {/* Quarterly Breakdown */}
                <div className="glass-card overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/30">
                    <h3 className="font-semibold">Quarterly Payment Schedule</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {selectedSchedule.quarterlyPayments.map((payment, index) => (
                      <div key={index} className="p-4 flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-full",
                          payment.status === 'paid' ? 'bg-success/10' :
                          payment.status === 'due' ? 'bg-warning/10' : 'bg-muted'
                        )}>
                          {getQuarterStatusIcon(payment.status)}
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{payment.quarter}</p>
                          <p className="text-sm text-muted-foreground">Due: {payment.dueDate}</p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-accent">{formatCurrency(payment.amount)}</p>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                            getQuarterStatusClass(payment.status)
                          )}>
                            {payment.status === 'paid' && payment.paidDate ? (
                              <>Paid {payment.paidDate}</>
                            ) : payment.status === 'due' ? (
                              'Due Now'
                            ) : (
                              'Upcoming'
                            )}
                          </span>
                        </div>

                        {payment.status === 'due' && (
                          <button
                            onClick={() => handleMakePayment(selectedSchedule.id, index)}
                            className="px-3 py-1.5 bg-success text-success-foreground rounded-md text-sm font-medium hover:bg-success/90 transition-colors flex items-center gap-1"
                          >
                            <CreditCard className="w-4 h-4" />
                            Record Payment
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Flow Diagram */}
                <div className="glass-card p-6">
                  <h3 className="font-semibold mb-4">Payment Flow</h3>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 text-center p-4 bg-primary/10 rounded-lg">
                      <Building className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">MDA Budget</p>
                      <p className="text-xs text-muted-foreground">Budget Vote Allocation</p>
                    </div>
                    <div className="text-muted-foreground">→</div>
                    <div className="flex-1 text-center p-4 bg-accent/10 rounded-lg">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-accent" />
                      <p className="text-sm font-medium">Treasury</p>
                      <p className="text-xs text-muted-foreground">Fiscal Agent</p>
                    </div>
                    <div className="text-muted-foreground">→</div>
                    <div className="flex-1 text-center p-4 bg-success/10 rounded-lg">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-success" />
                      <p className="text-sm font-medium">SPV</p>
                      <p className="text-xs text-muted-foreground">Services Bond Holders</p>
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
