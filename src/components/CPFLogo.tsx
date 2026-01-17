import { cn } from "@/lib/utils";

interface CPFLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  collapsed?: boolean;
}

const CPFLogo = ({ className, size = "md", showText = true, collapsed = false }: CPFLogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const imageSizeClasses = {
    sm: "h-8 w-auto",
    md: "h-10 w-auto",
    lg: "h-12 w-auto",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo Container with Smooth Corners and Effects */}
      <div className={cn(
        "relative flex items-center justify-center",
        "rounded-2xl p-1.5",
        "bg-gradient-to-br from-card to-card/95",
        "backdrop-blur-sm",
        "border border-border",
        "shadow-md",
        "transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/10",
        "hover:scale-[1.02]",
        size === "sm" ? "p-1" : size === "md" ? "p-1.5" : "p-2"
      )}>
        {/* Logo Image with Smooth Corners */}
        <img
          src="/logo.png"
          alt="CPF Platform Logo"
          className={cn(
            "object-contain",
            "rounded-xl",
            "transition-all duration-300",
            imageSizeClasses[size]
          )}
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
          }}
        />
      </div>
      
      {/* Logo Text */}
      {showText && !collapsed && (
        <div className="overflow-hidden">
          <h1 className="font-display text-lg font-bold text-foreground tracking-tight">
            CPF Platform
          </h1>
          <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
            Settlement System
          </p>
        </div>
      )}
    </div>
  );
};

export default CPFLogo;
