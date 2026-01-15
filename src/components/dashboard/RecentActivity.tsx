import { timelineEvents, getStatusColor } from '@/data/mockData';
import { Calendar, DollarSign, FileCheck, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
        {timelineEvents.slice(0, 5).map((event, index) => {
          const Icon = typeIcons[event.type];
          
          return (
            <div 
              key={event.id}
              className="flex gap-3 p-2.5 rounded hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                event.status === 'completed' ? 'bg-success/10 text-success' :
                event.status === 'in-progress' ? 'bg-accent/10 text-accent' :
                'bg-muted text-muted-foreground'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{event.description}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{event.date}</p>
              </div>

              {event.amount && (
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-foreground">
                    KES {(event.amount / 1000000000).toFixed(1)}B
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
