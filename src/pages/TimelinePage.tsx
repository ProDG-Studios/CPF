import TopBar from '@/components/layout/TopBar';
import { getStatusColor } from '@/data/mockData';
import { useData } from '@/contexts/DataContext';
import { 
  Calendar, 
  DollarSign, 
  FileCheck, 
  FileText,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

const typeIcons = {
  milestone: Calendar,
  payment: DollarSign,
  verification: FileCheck,
  document: FileText,
};

const typeColors = {
  milestone: 'bg-primary text-primary-foreground',
  payment: 'bg-success text-success-foreground',
  verification: 'bg-accent text-accent-foreground',
  document: 'bg-secondary text-secondary-foreground',
};

const TimelinePage = () => {
  const { timelineEvents, transactionSteps, activityLog } = useData();
  const [showAddEvent, setShowAddEvent] = useState(false);

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
              <h2 className="font-display text-xl font-bold text-foreground">
                Settlement Program Timeline
              </h2>
              <p className="text-muted-foreground">
                Phase 1: Fast-track bills ≤ KES 2M
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{completedEvents.length}</p>
                <p className="text-xs text-muted-foreground">Events Complete</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{completedSteps}</p>
                <p className="text-xs text-muted-foreground">Steps Done</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{activityLog.length}</p>
                <p className="text-xs text-muted-foreground">Actions Logged</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">{upcomingEvents.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </div>

          {/* Timeline Progress */}
          <div className="relative">
            <div className="h-2 bg-muted rounded-full">
              <div 
                className="h-full bg-success rounded-full transition-all"
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
                <h3 className="font-display text-lg font-bold">Events Timeline</h3>
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
                            <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-success text-success-foreground">
                              <CheckCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 p-4 rounded-lg bg-success/5 border border-success/20">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-foreground">{activity.title}</h4>
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
                                      Just now
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                                </div>
                                {activity.amount && (
                                  <div className="text-right shrink-0">
                                    <p className="font-bold text-accent">
                                      KES {(activity.amount / 1000000).toFixed(1)}M
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
                          event.status === 'completed' ? 'bg-success text-success-foreground' :
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
                          event.status === 'completed' ? 'bg-success/5 border border-success/20' :
                          event.status === 'in-progress' ? 'bg-primary/10 border border-primary/30' :
                          'bg-muted/30 border border-border'
                        )}>
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-foreground">{event.title}</h4>
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-xs font-medium",
                                  getStatusColor(event.status)
                                )}>
                                  {event.status === 'in-progress' ? 'In Progress' : event.status}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                            {event.amount && (
                              <div className="text-right shrink-0">
                                <p className="font-bold text-accent">
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
                              "px-2 py-0.5 rounded",
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
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold mb-4">Transaction Steps</h3>
              
              <div className="space-y-3">
                {transactionSteps.map((step) => (
                  <div 
                    key={step.step}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                      step.status === 'completed' ? 'bg-success text-success-foreground' :
                      step.status === 'active' ? 'bg-accent text-accent-foreground animate-pulse' :
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
                        <p className="text-xs text-success">✓ {step.completedDate}</p>
                      )}
                      {step.estimatedDate && step.status !== 'completed' && (
                        <p className="text-xs text-muted-foreground">Est: {step.estimatedDate}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => window.location.href = '/workflow'}
                className="w-full mt-4 px-4 py-2 bg-secondary text-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
              >
                Manage Workflow <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold mb-4">Event Types</h3>
              
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

            {/* Key Dates */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold mb-4">Key Dates</h3>
              
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

            {/* Activity Count */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold mb-4">Session Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Actions This Session</span>
                  <span className="text-lg font-bold text-accent">{activityLog.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Steps Completed</span>
                  <span className="text-lg font-bold text-success">{completedSteps}/11</span>
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
