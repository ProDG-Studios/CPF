import { useState } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useData } from '@/contexts/DataContext';
import { X, ChevronDown, ChevronUp, Filter, RotateCcw } from 'lucide-react';
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
  const { mdas, suppliers, bills } = useData();
  const [expandedSections, setExpandedSections] = useState<string[]>(['status']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const statuses = ['pending', 'verified', 'processing', 'paid', 'rejected'];
  const priorities = ['high', 'medium', 'low'];

  // Get unique categories from actual bills
  const categories = [...new Set(bills.map(b => b.category))].sort();

  // Calculate counts for each status
  const statusCounts = {
    pending: bills.filter(b => b.status === 'pending').length,
    verified: bills.filter(b => b.status === 'verified').length,
    processing: bills.filter(b => b.status === 'processing').length,
    paid: bills.filter(b => b.status === 'paid').length,
    rejected: bills.filter(b => b.status === 'rejected').length,
  };

  // Calculate counts for each MDA
  const getMDABillCount = (mdaId: string) => bills.filter(b => b.mdaId === mdaId).length;

  // Calculate counts for each supplier
  const getSupplierBillCount = (supplierId: string) => bills.filter(b => b.supplierId === supplierId).length;

  // Calculate counts for each category
  const getCategoryBillCount = (category: string) => bills.filter(b => b.category === category).length;

  // Calculate counts for each priority
  const getPriorityBillCount = (priority: string) => bills.filter(b => b.priority === priority).length;

  const FilterSection = ({ 
    title, 
    id, 
    children,
    count 
  }: { 
    title: string; 
    id: string; 
    children: React.ReactNode;
    count?: number;
  }) => {
    const isExpanded = expandedSections.includes(id);
    
    return (
      <div className="border-b border-border last:border-b-0">
        <button
          onClick={() => toggleSection(id)}
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{title}</span>
            {count !== undefined && count > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                {count}
              </span>
            )}
          </div>
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
    <button 
      type="button"
      onClick={onChange}
      className="flex items-center gap-2 cursor-pointer group py-1 w-full text-left hover:bg-muted/30 rounded-md px-1 -mx-1 transition-colors"
    >
      <div className={cn(
        "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0",
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
      <span className="text-sm flex-1 capitalize truncate">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground shrink-0">{count}</span>
      )}
    </button>
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
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {showStatus && (
        <FilterSection title="Status" id="status" count={filters.status.length}>
          {statuses.map((status) => (
            <Checkbox
              key={status}
              label={status}
              checked={filters.status.includes(status)}
              onChange={() => toggleArrayFilter('status', status)}
              count={statusCounts[status as keyof typeof statusCounts]}
            />
          ))}
        </FilterSection>
      )}

      {showPriority && (
        <FilterSection title="Priority" id="priority" count={filters.priority.length}>
          {priorities.map((priority) => (
            <Checkbox
              key={priority}
              label={priority}
              checked={filters.priority.includes(priority)}
              onChange={() => toggleArrayFilter('priority', priority)}
              count={getPriorityBillCount(priority)}
            />
          ))}
        </FilterSection>
      )}

      {showCategory && (
        <FilterSection title="Category" id="category" count={filters.categories.length}>
          {categories.map((category) => (
            <Checkbox
              key={category}
              label={category}
              checked={filters.categories.includes(category)}
              onChange={() => toggleArrayFilter('categories', category)}
              count={getCategoryBillCount(category)}
            />
          ))}
        </FilterSection>
      )}

      {showMDA && (
        <FilterSection title="MDA" id="mda" count={filters.mdaIds.length}>
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {mdas.filter(mda => getMDABillCount(mda.id) > 0).map((mda) => (
              <Checkbox
                key={mda.id}
                label={mda.shortName}
                checked={filters.mdaIds.includes(mda.id)}
                onChange={() => toggleArrayFilter('mdaIds', mda.id)}
                count={getMDABillCount(mda.id)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {showSupplier && (
        <FilterSection title="Supplier" id="supplier" count={filters.supplierIds.length}>
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {suppliers.filter(s => getSupplierBillCount(s.id) > 0).slice(0, 15).map((supplier) => (
              <Checkbox
                key={supplier.id}
                label={supplier.name}
                checked={filters.supplierIds.includes(supplier.id)}
                onChange={() => toggleArrayFilter('supplierIds', supplier.id)}
                count={getSupplierBillCount(supplier.id)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="px-4 py-3 bg-primary/5 border-t border-border">
          <div className="flex flex-wrap gap-1.5">
            {filters.status.map(s => (
              <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                {s}
                <button onClick={() => toggleArrayFilter('status', s)} className="hover:text-primary/70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.priority.map(p => (
              <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 bg-warning/10 text-warning text-xs rounded-full">
                {p}
                <button onClick={() => toggleArrayFilter('priority', p)} className="hover:text-warning/70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.categories.map(c => (
              <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full">
                {c}
                <button onClick={() => toggleArrayFilter('categories', c)} className="hover:text-accent/70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.mdaIds.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-muted-foreground text-xs rounded-full">
                {filters.mdaIds.length} MDA{filters.mdaIds.length > 1 ? 's' : ''}
                <button onClick={() => setFilter('mdaIds', [])} className="hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.supplierIds.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-muted-foreground text-xs rounded-full">
                {filters.supplierIds.length} Supplier{filters.supplierIds.length > 1 ? 's' : ''}
                <button onClick={() => setFilter('supplierIds', [])} className="hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
