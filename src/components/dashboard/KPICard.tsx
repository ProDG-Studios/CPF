import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'secondary';
  onClick?: () => void;
  isClickable?: boolean;
}

const KPICard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'default',
  onClick,
  isClickable = false 
}: KPICardProps) => {
  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    secondary: 'bg-muted text-muted-foreground',
  };

  const borderStyles = {
    default: '',
    accent: 'border-l-2 border-l-accent',
    success: 'border-l-2 border-l-success',
    warning: 'border-l-2 border-l-warning',
    secondary: '',
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative bg-card border border-border rounded-lg p-4 transition-colors duration-150",
        borderStyles[variant],
        isClickable && "cursor-pointer hover:bg-muted/30"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2 rounded-md", iconStyles[variant])}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend.isPositive ? "text-success" : "text-destructive"
          )}>
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend.value}%
          </div>
        )}
      </div>
      
      <h3 className="text-2xl font-bold text-foreground mb-0.5 font-display">
        {value}
      </h3>
      <p className="text-xs text-muted-foreground font-medium">{title}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>
      )}
      {trend?.label && (
        <p className="text-xs text-muted-foreground mt-1.5">{trend.label}</p>
      )}
    </div>
  );
};

export default KPICard;
