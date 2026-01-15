import TopBar from '@/components/layout/TopBar';
import { timelineEvents, transactionSteps, getStatusColor } from '@/data/mockData';
import { 
  Calendar, 
  DollarSign, 
  FileCheck, 
  FileText,
  CheckCircle,
  Clock,
  ArrowRight,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const completedEvents = timelineEvents.filter(e => e.status === 'completed');
  const upcomingEvents = timelineEvents.filter(e => e.status !== 'completed');

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
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{completedEvents.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">1</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">{upcomingEvents.length - 1}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </div>

          {/* Timeline Progress */}
          <div className="relative">
            <div className="h-2 bg-muted rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-success via-primary to-accent rounded-full transition-all"
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
              <h3 className="font-display text-lg font-bold mb-6">Events Timeline</h3>
              
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-6">
                  {timelineEvents.map((event, index) => {
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;
