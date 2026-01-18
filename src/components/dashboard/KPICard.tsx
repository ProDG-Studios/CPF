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
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white border border-neutral-200 rounded-xl p-5 transition-all duration-200 relative overflow-hidden",
        isClickable && "cursor-pointer hover:shadow-lg hover:border-amber-200"
      )}
    >
      {/* Gold top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />
      
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200/50">
          <Icon className="w-5 h-5 text-amber-600" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full",
            trend.isPositive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
          )}>
            {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}%
          </div>
        )}
      </div>
      
      <p className="text-2xl font-bold text-neutral-900 mb-1">{value}</p>
      <p className="text-sm font-medium text-neutral-600">{title}</p>
      {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
    </div>
  );
};

export default KPICard;