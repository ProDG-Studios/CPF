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
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Recent Activity
          </h3>
          <p className="text-sm text-muted-foreground">Latest updates & milestones</p>
        </div>
        <button 
          onClick={() => navigate('/timeline')}
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
        >
          View all <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {timelineEvents.slice(0, 5).map((event, index) => {
          const Icon = typeIcons[event.type];
          
          return (
            <div 
              key={event.id}
              className="flex gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  event.status === 'completed' ? 'bg-success/20 text-success' :
                  event.status === 'in-progress' ? 'bg-primary/20 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                {index < timelineEvents.slice(0, 5).length - 1 && (
                  <div className="absolute top-10 left-1/2 w-0.5 h-8 -translate-x-1/2 bg-border" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground truncate">{event.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{event.date}</p>
              </div>

              {event.amount && (
                <div className="text-right shrink-0">
                  <p className="font-semibold text-accent">
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
