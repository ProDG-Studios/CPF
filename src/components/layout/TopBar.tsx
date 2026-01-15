import { Bell, User, Search, X } from "lucide-react";
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
    <header className="sticky top-0 z-30 bg-card border-b border-border">
      <div className="flex items-center justify-between px-6 h-14">
        <div>
          <h1 className="text-base font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          {showSearch ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Search..."
                value={filters.searchTerm}
                onChange={(e) => setFilter('searchTerm', e.target.value)}
                className="w-48 px-3 py-1.5 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                autoFocus
              />
              <button
                onClick={() => { setShowSearch(false); setFilter('searchTerm', ''); }}
                className="p-1.5 hover:bg-secondary rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-secondary rounded-md transition-colors"
            >
              <Search className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {/* Filter Badge */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-md text-xs font-medium hover:bg-accent/15 transition-colors"
            >
              {activeFilterCount} filters
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Notifications */}
          <button className="relative p-2 hover:bg-secondary rounded-md transition-colors">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full" />
          </button>

          <div className="w-px h-5 bg-border mx-1" />

          {/* User */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground hidden md:block">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
