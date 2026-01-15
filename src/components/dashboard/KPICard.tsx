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
  };
  variant?: 'default' | 'accent' | 'success' | 'warning';
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
  const accentColor = {
    default: 'border-l-primary',
    accent: 'border-l-accent',
    success: 'border-l-success',
    warning: 'border-l-warning',
  };

  const iconBg = {
    default: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "glass-card p-4 border-l-2 transition-colors",
        accentColor[variant],
        isClickable && "cursor-pointer hover:bg-secondary/50"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2 rounded-md", iconBg[variant])}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            trend.isPositive ? "text-success" : "text-destructive"
          )}>
            {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}%
          </div>
        )}
      </div>
      
      <p className="text-2xl font-semibold text-foreground mb-0.5">{value}</p>
      <p className="text-xs text-muted-foreground">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
};

export default KPICard;
