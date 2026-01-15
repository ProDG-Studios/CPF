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
  const variantStyles = {
    default: 'bg-card border border-border',
    accent: 'bg-card border border-accent',
    success: 'bg-card border border-success',
    warning: 'bg-card border border-warning',
    secondary: 'bg-card border border-border',
  };

  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    accent: 'bg-accent/15 text-foreground',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/15 text-warning',
    secondary: 'bg-muted text-muted-foreground',
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-lg p-6 transition-colors duration-200",
        variantStyles[variant],
        isClickable && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-lg", iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend.isPositive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
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
      
      <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">
        {value}
      </h3>
      <p className="text-sm text-muted-foreground">{title}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>
      )}
      {trend?.label && (
        <p className="text-xs text-muted-foreground mt-2">{trend.label}</p>
      )}
    </div>
  );
};

export default KPICard;
