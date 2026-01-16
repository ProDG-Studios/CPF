import TopBar from '@/components/layout/TopBar';
import { getStatusColor, formatCurrency } from '@/data/mockData';
import { useData } from '@/contexts/DataContext';
import { 
  Calendar, 
  DollarSign, 
  FileCheck, 
  FileText,
  CheckCircle,
  Clock,
  ArrowRight,
  Download,
  Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { generateCSV, generatePrintableReport } from '@/lib/exportUtils';
import { toast } from 'sonner';

const typeIcons = {
  milestone: Calendar,
  payment: DollarSign,
  verification: FileCheck,
  document: FileText,
};

const typeColors = {
  milestone: 'bg-[hsl(262,90%,50%)] text-white',
  payment: 'bg-[hsl(142,85%,35%)] text-white',
  verification: 'bg-[hsl(199,95%,45%)] text-white',
  document: 'bg-secondary text-secondary-foreground',
};

const TimelinePage = () => {
  const navigate = useNavigate();
  const { timelineEvents, transactionSteps, activityLog, bills, getStats } = useData();

  const stats = getStats();
  const completedEvents = timelineEvents.filter(e => e.status === 'completed');
  const upcomingEvents = timelineEvents.filter(e => e.status !== 'completed');
  const completedSteps = transactionSteps.filter(s => s.status === 'completed').length;

  // Combine timeline events with recent activity
  const recentActivities = activityLog.slice(0, 5).map(activity => ({
    id: activity.id,
    date: activity.timestamp.toISOString().split('T')[0],
    title: activity.title,
    description: activity.description,
    type: activity.type.includes('payment') ? 'payment' as const : 
          activity.type.includes('verified') ? 'verification' as const : 
          'document' as const,
    amount: activity.amount,
    status: 'completed' as const,
  }));

  const handleExportCSV = () => {
    const data = [
      ...timelineEvents.map(e => ({
        Type: 'Event',
        Title: e.title,
        Description: e.description,
        Date: e.date,
        Status: e.status,
        Amount: e.amount || '',
        Category: e.type,
      })),
      ...activityLog.map(a => ({
        Type: 'Activity',
        Title: a.title,
        Description: a.description,
        Date: a.timestamp.toISOString().split('T')[0],
        Status: 'completed',
        Amount: a.amount || '',
        Category: a.type,
      })),
    ];
    generateCSV(data, 'timeline_export');
    toast.success('Timeline exported to CSV');
  };

  const handlePrintReport = () => {
    const content = `
      <div style="margin-bottom: 24px;">
        <h2 style="margin-bottom: 16px; color: #333;">Progress Summary</h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
          <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
            <p style="font-size: 28px; font-weight: bold; color: #22c55e; margin: 0;">${completedEvents.length}</p>
            <p style="color: #666; margin: 4px 0 0;">Events Complete</p>
          </div>
          <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
            <p style="font-size: 28px; font-weight: bold; color: #3b82f6; margin: 0;">${completedSteps}/11</p>
            <p style="color: #666; margin: 4px 0 0;">Steps Done</p>
          </div>
          <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
            <p style="font-size: 28px; font-weight: bold; margin: 0;">${activityLog.length}</p>
            <p style="color: #666; margin: 4px 0 0;">Actions Logged</p>
          </div>
          <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
            <p style="font-size: 28px; font-weight: bold; margin: 0;">${upcomingEvents.length}</p>
            <p style="color: #666; margin: 4px 0 0;">Upcoming</p>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 24px;">
        <h2 style="margin-bottom: 16px; color: #333;">Transaction Steps</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Step</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Title</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Status</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${transactionSteps.map(s => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${s.step}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${s.title}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-transform: capitalize; color: ${s.status === 'completed' ? '#22c55e' : s.status === 'active' ? '#3b82f6' : '#666'};">${s.status}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${s.completedDate || s.estimatedDate || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 24px;">
        <h2 style="margin-bottom: 16px; color: #333;">Timeline Events</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Date</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Event</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Type</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${timelineEvents.map(e => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${e.date}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${e.title}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-transform: capitalize;">${e.type}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-transform: capitalize; color: ${e.status === 'completed' ? '#22c55e' : e.status === 'in-progress' ? '#3b82f6' : '#666'};">${e.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    generatePrintableReport('Settlement Timeline Report', content);
  };

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Timeline" 
        subtitle="Project milestones and schedule"
      />
      
      <div className="p-6">
        {/* Progress Summary */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Settlement Program Timeline
              </h2>
              <p className="text-muted-foreground">
                Phase 1: Fast-track bills ≤ KES 2M
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[hsl(142,85%,35%)]">{completedEvents.length}</p>
                  <p className="text-xs text-muted-foreground">Events Complete</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[hsl(262,90%,50%)]">{completedSteps}</p>
                  <p className="text-xs text-muted-foreground">Steps Done</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[hsl(199,95%,45%)]">{activityLog.length}</p>
                  <p className="text-xs text-muted-foreground">Actions Logged</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-muted-foreground">{upcomingEvents.length}</p>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  title="Export to CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrintReport}
                  className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  title="Print Report"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Timeline Progress */}
          <div className="relative">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-[hsl(142,85%,35%)] rounded-full transition-all"
                style={{ width: `${(completedEvents.length / timelineEvents.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-4">
              <div className="text-left">
                <p className="text-sm font-medium">Jan 2024</p>
                <p className="text-xs text-muted-foreground">Phase 1 Start</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Feb 2024</p>
                <p className="text-xs text-muted-foreground">Bond Issuance</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Mar 2024</p>
                <p className="text-xs text-muted-foreground">NSE Listing</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Timeline */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Events Timeline</h3>
              </div>
              
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-6">
                  {/* Recent Activity Events First */}
                  {recentActivities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-3 pl-14">RECENT ACTIVITY</p>
                      {recentActivities.map((activity) => {
                        const Icon = typeIcons[activity.type] || FileText;
                        return (
                          <div 
                            key={activity.id}
                            className="relative flex gap-4 pl-2 mb-4"
                          >
                            <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[hsl(142,85%,35%)] text-white">
                              <CheckCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 p-4 rounded-lg bg-[hsl(142,85%,35%)]/5 border border-[hsl(142,85%,35%)]/20">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-foreground">{activity.title}</h4>
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[hsl(142,85%,35%)]/20 text-[hsl(142,85%,35%)]">
                                      Just now
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                                </div>
                                {activity.amount && (
                                  <div className="text-right shrink-0">
                                    <p className="font-bold text-[hsl(199,95%,45%)]">
                                      {formatCurrency(activity.amount, true)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-xs font-medium text-muted-foreground mb-3 pl-14">SCHEDULED EVENTS</p>

                  {timelineEvents.map((event) => {
                    const Icon = typeIcons[event.type];
                    const isActive = event.status === 'in-progress';
                    
                    return (
                      <div 
                        key={event.id}
                        className={cn(
                          "relative flex gap-4 pl-2",
                          isActive && "animate-pulse"
                        )}
                      >
                        {/* Icon */}
                        <div className={cn(
                          "relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                          event.status === 'completed' ? 'bg-[hsl(142,85%,35%)] text-white' :
                          event.status === 'in-progress' ? typeColors[event.type] :
                          'bg-muted text-muted-foreground'
                        )}>
                          {event.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>

                        {/* Content */}
                        <div className={cn(
                          "flex-1 p-4 rounded-lg transition-colors",
                          event.status === 'completed' ? 'bg-[hsl(142,85%,35%)]/5 border border-[hsl(142,85%,35%)]/20' :
                          event.status === 'in-progress' ? 'bg-[hsl(262,90%,50%)]/10 border border-[hsl(262,90%,50%)]/30' :
                          'bg-muted/30 border border-border'
                        )}>
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-foreground">{event.title}</h4>
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-xs font-medium",
                                  event.status === 'completed' ? 'bg-[hsl(142,85%,35%)]/20 text-[hsl(142,85%,35%)]' :
                                  event.status === 'in-progress' ? 'bg-[hsl(262,90%,50%)]/20 text-[hsl(262,90%,50%)]' :
                                  'bg-muted text-muted-foreground'
                                )}>
                                  {event.status === 'in-progress' ? 'In Progress' : event.status}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                            {event.amount && (
                              <div className="text-right shrink-0">
                                <p className="font-bold text-[hsl(199,95%,45%)]">
                                  KES {(event.amount / 1000000000).toFixed(1)}B
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {event.date}
                            </span>
                            <span className={cn(
                              "px-2 py-0.5 rounded capitalize",
                              typeColors[event.type]
                            )}>
                              {event.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Transaction Steps Progress */}
            <div className="glass-card p-5">
              <h3 className="text-lg font-semibold mb-4">Transaction Steps</h3>
              
              <div className="space-y-3">
                {transactionSteps.map((step) => (
                  <div 
                    key={step.step}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                      step.status === 'completed' ? 'bg-[hsl(142,85%,35%)] text-white' :
                      step.status === 'active' ? 'bg-[hsl(262,90%,50%)] text-white animate-pulse' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {step.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        step.status === 'pending' && 'text-muted-foreground'
                      )}>
                        {step.title}
                      </p>
                      {step.completedDate && (
                        <p className="text-xs text-[hsl(142,85%,35%)]">✓ {step.completedDate}</p>
                      )}
                      {step.estimatedDate && step.status !== 'completed' && (
                        <p className="text-xs text-muted-foreground">Est: {step.estimatedDate}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/workflow')}
                className="w-full mt-4 px-4 py-2 bg-secondary text-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
              >
                Manage Workflow <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="glass-card p-5">
              <h3 className="text-lg font-semibold mb-4">Event Types</h3>
              
              <div className="space-y-3">
                {Object.entries(typeIcons).map(([type, Icon]) => (
                  <div key={type} className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      typeColors[type as keyof typeof typeColors]
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Stats */}
            <div className="glass-card p-5">
              <h3 className="text-lg font-semibold mb-4">Session Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Actions This Session</span>
                  <span className="text-lg font-bold text-[hsl(199,95%,45%)]">{activityLog.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bills Verified</span>
                  <span className="text-lg font-bold text-[hsl(142,85%,35%)]">{stats.verifiedBills}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bills Paid</span>
                  <span className="text-lg font-bold text-[hsl(262,90%,50%)]">{stats.paidBills}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Steps Completed</span>
                  <span className="text-lg font-bold text-foreground">{completedSteps}/11</span>
                </div>
              </div>
            </div>

            {/* Key Dates */}
            <div className="glass-card p-5">
              <h3 className="text-lg font-semibold mb-4">Key Dates</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Program Start</span>
                  <span className="text-sm font-medium">Jan 5, 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bond Issuance</span>
                  <span className="text-sm font-medium">Feb 1, 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">First Payments</span>
                  <span className="text-sm font-medium">Feb 20, 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">NSE Listing</span>
                  <span className="text-sm font-medium">Mar 1, 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Phase 1 Complete</span>
                  <span className="text-sm font-medium">Mar 31, 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;
