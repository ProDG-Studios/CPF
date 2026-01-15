import { useState } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { mdaData, supplierData } from '@/data/mockData';
import { X, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  showMDA?: boolean;
  showSupplier?: boolean;
  showStatus?: boolean;
  showCategory?: boolean;
  showPriority?: boolean;
  showAmount?: boolean;
}

const FilterPanel = ({
  showMDA = true,
  showSupplier = true,
  showStatus = true,
  showCategory = true,
  showPriority = true,
  showAmount = false,
}: FilterPanelProps) => {
  const { filters, toggleArrayFilter, setFilter, resetFilters, activeFilterCount } = useFilters();
  const [expandedSections, setExpandedSections] = useState<string[]>(['status']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const statuses = ['verified', 'pending', 'processing', 'paid', 'rejected'];
  const categories = ['Construction', 'Medical Equipment', 'IT Services', 'Logistics', 'Pharmaceuticals', 'General Supplies', 'Others'];
  const priorities = ['high', 'medium', 'low'];

  const FilterSection = ({ 
    title, 
    id, 
    children 
  }: { 
    title: string; 
    id: string; 
    children: React.ReactNode 
  }) => {
    const isExpanded = expandedSections.includes(id);
    
    return (
      <div className="border-b border-border last:border-b-0">
        <button
          onClick={() => toggleSection(id)}
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/30 transition-colors"
        >
          <span className="font-medium text-sm">{title}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {isExpanded && (
          <div className="px-4 pb-3 space-y-2">
            {children}
          </div>
        )}
      </div>
    );
  };

  const Checkbox = ({ 
    label, 
    checked, 
    onChange,
    count 
  }: { 
    label: string; 
    checked: boolean; 
    onChange: () => void;
    count?: number;
  }) => (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className={cn(
        "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
        checked 
          ? "bg-primary border-primary" 
          : "border-muted-foreground/50 group-hover:border-primary"
      )}>
        {checked && (
          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm flex-1 capitalize">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">{count}</span>
      )}
    </label>
  );

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
          >
            Clear all
          </button>
        )}
      </div>

      {showStatus && (
        <FilterSection title="Status" id="status">
          {statuses.map((status) => (
            <Checkbox
              key={status}
              label={status}
              checked={filters.status.includes(status)}
              onChange={() => toggleArrayFilter('status', status)}
            />
          ))}
        </FilterSection>
      )}

      {showPriority && (
        <FilterSection title="Priority" id="priority">
          {priorities.map((priority) => (
            <Checkbox
              key={priority}
              label={priority}
              checked={filters.priority.includes(priority)}
              onChange={() => toggleArrayFilter('priority', priority)}
            />
          ))}
        </FilterSection>
      )}

      {showCategory && (
        <FilterSection title="Category" id="category">
          {categories.map((category) => (
            <Checkbox
              key={category}
              label={category}
              checked={filters.categories.includes(category)}
              onChange={() => toggleArrayFilter('categories', category)}
            />
          ))}
        </FilterSection>
      )}

      {showMDA && (
        <FilterSection title="MDA" id="mda">
          <div className="max-h-48 overflow-y-auto space-y-2">
            {mdaData.map((mda) => (
              <Checkbox
                key={mda.id}
                label={mda.shortName}
                checked={filters.mdaIds.includes(mda.id)}
                onChange={() => toggleArrayFilter('mdaIds', mda.id)}
                count={mda.totalBills}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {showSupplier && (
        <FilterSection title="Supplier" id="supplier">
          <div className="max-h-48 overflow-y-auto space-y-2">
            {supplierData.slice(0, 8).map((supplier) => (
              <Checkbox
                key={supplier.id}
                label={supplier.name}
                checked={filters.supplierIds.includes(supplier.id)}
                onChange={() => toggleArrayFilter('supplierIds', supplier.id)}
              />
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );
};

export default FilterPanel;
