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
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            {showSearch ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilter('searchTerm', e.target.value)}
                  className="w-64 px-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setFilter('searchTerm', '');
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Search className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Filter indicator */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {activeFilterCount} active
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Refresh */}
          <button className="p-2 hover:bg-muted rounded-lg transition-colors group">
            <RefreshCw className="w-5 h-5 text-muted-foreground group-hover:rotate-180 transition-transform duration-500" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </button>

          {/* User */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="hidden md:block">
              <span className="text-sm font-medium">Admin User</span>
              <p className="text-xs text-muted-foreground">Treasury Dept.</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
