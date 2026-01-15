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
    default: 'from-primary/20 to-primary/5 hover:from-primary/30',
    accent: 'from-accent/20 to-accent/5 hover:from-accent/30',
    success: 'from-success/20 to-success/5 hover:from-success/30',
    warning: 'from-warning/20 to-warning/5 hover:from-warning/30',
    secondary: 'from-secondary/40 to-secondary/20 hover:from-secondary/50',
  };

  const iconStyles = {
    default: 'bg-primary/20 text-primary',
    accent: 'bg-accent/20 text-accent',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    secondary: 'bg-secondary text-secondary-foreground',
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/50 p-6 transition-all duration-300",
        "bg-gradient-to-br",
        variantStyles[variant],
        isClickable && "cursor-pointer hover:scale-[1.02] hover:shadow-lg"
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
