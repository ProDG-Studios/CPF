import { Bell, User, Search, Filter, X, RefreshCw } from "lucide-react";
import { useFilters } from "@/contexts/FilterContext";
import { useState } from "react";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

const TopBar = ({ title, subtitle }: TopBarProps) => {
  const { filters, setFilter, resetFilters, activeFilterCount } = useFilters();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border">
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-semibold text-foreground leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            {showSearch ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilter('searchTerm', e.target.value)}
                  className="w-56 px-3 py-1.5 bg-muted border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setFilter('searchTerm', '');
                  }}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 hover:bg-muted rounded transition-colors"
              >
                <Search className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Filter indicator */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-accent/10 text-accent rounded text-xs font-medium hover:bg-accent/15 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              {activeFilterCount}
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Refresh */}
          <button className="p-2 hover:bg-muted rounded transition-colors group">
            <RefreshCw className="w-4 h-4 text-muted-foreground group-hover:rotate-180 transition-transform duration-500" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-muted rounded transition-colors">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* User */}
          <div className="flex items-center gap-2 pl-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div className="hidden md:block">
              <span className="text-sm font-medium text-foreground">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
