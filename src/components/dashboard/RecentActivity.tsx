import { Calendar, DollarSign, FileCheck, FileText, ArrowRight, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/data/mockData';

const typeIcons = {
  bill_verified: FileCheck,
  bill_processed: Clock,
  bill_paid: DollarSign,
  bill_rejected: XCircle,
  step_completed: Calendar,
  payment_made: DollarSign,
  supplier_verified: FileText,
  milestone: Calendar,
  payment: DollarSign,
  verification: FileCheck,
  document: FileText,
};

const RecentActivity = () => {
  const navigate = useNavigate();
  const { activityLog, timelineEvents } = useData();
  
  // Combine activity log with timeline events for display
  const combinedActivity = [
    ...activityLog.slice(0, 10).map(log => ({
      id: log.id,
      title: log.title,
      description: log.description,
      type: log.type,
      amount: log.amount,
      status: 'completed' as const,
      date: log.timestamp,
    })),
    ...(activityLog.length < 5 ? timelineEvents.slice(0, 5 - activityLog.length).map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type as keyof typeof typeIcons,
      amount: event.amount,
      status: event.status,
      date: new Date(event.date),
    })) : []),
  ].slice(0, 5);
  
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">
            {activityLog.length > 0 ? `${activityLog.length} actions recorded` : 'Latest updates'}
          </p>
        </div>
        <button 
          onClick={() => navigate('/timeline')}
          className="text-xs text-muted-foreground font-medium flex items-center gap-1 hover:text-foreground"
        >
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-1">
        {combinedActivity.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs">Start by verifying or processing bills</p>
          </div>
        ) : (
          combinedActivity.map((event) => {
            const Icon = typeIcons[event.type as keyof typeof typeIcons] || FileText;
            
            return (
              <div 
                key={event.id}
                className="flex gap-3 p-2.5 rounded-md hover:bg-secondary transition-colors cursor-pointer"
              >
                <div className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                  event.status === 'completed' ? 'bg-success/10 text-success' :
                  event.status === 'in-progress' ? 'bg-secondary text-muted-foreground' :
                  'bg-secondary text-muted-foreground'
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{event.description}</p>
                </div>

                {event.amount && (
                  <span className="text-sm font-medium text-foreground shrink-0">
                    {formatCurrency(event.amount, true)}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
