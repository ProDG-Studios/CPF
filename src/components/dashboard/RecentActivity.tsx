import { timelineEvents } from '@/data/mockData';
import { Calendar, DollarSign, FileCheck, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const typeIcons = {
  milestone: Calendar,
  payment: DollarSign,
  verification: FileCheck,
  document: FileText,
};

const RecentActivity = () => {
  const navigate = useNavigate();
  
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">Latest updates</p>
        </div>
        <button 
          onClick={() => navigate('/timeline')}
          className="text-xs text-accent font-medium flex items-center gap-1 hover:underline"
        >
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-1">
        {timelineEvents.slice(0, 5).map((event) => {
          const Icon = typeIcons[event.type];
          
          return (
            <div 
              key={event.id}
              className="flex gap-3 p-2.5 rounded-md hover:bg-secondary transition-colors cursor-pointer"
            >
              <div className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                event.status === 'completed' ? 'bg-success/10 text-success' :
                event.status === 'in-progress' ? 'bg-accent/10 text-accent' :
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
                  KES {(event.amount / 1000000000).toFixed(1)}B
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
