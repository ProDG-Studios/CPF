import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface FilterState {
  dateRange: { start: string; end: string };
  status: string[];
  mdaIds: string[];
  supplierIds: string[];
  amountRange: { min: number; max: number };
  categories: string[];
  fiscalYear: string;
  priority: string[];
  searchTerm: string;
}

interface FilterContextType {
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  toggleArrayFilter: (key: 'status' | 'mdaIds' | 'supplierIds' | 'categories' | 'priority', value: string) => void;
  activeFilterCount: number;
}

const defaultFilters: FilterState = {
  dateRange: { start: '', end: '' },
  status: [],
  mdaIds: [],
  supplierIds: [],
  amountRange: { min: 0, max: Infinity },
  categories: [],
  fiscalYear: '',
  priority: [],
  searchTerm: '',
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const setFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleArrayFilter = useCallback((key: 'status' | 'mdaIds' | 'supplierIds' | 'categories' | 'priority', value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.status.length > 0) count++;
    if (filters.mdaIds.length > 0) count++;
    if (filters.supplierIds.length > 0) count++;
    if (filters.amountRange.min > 0 || filters.amountRange.max < Infinity) count++;
    if (filters.categories.length > 0) count++;
    if (filters.fiscalYear) count++;
    if (filters.priority.length > 0) count++;
    if (filters.searchTerm) count++;
    return count;
  }, [filters]);

  return (
    <FilterContext.Provider value={{ filters, setFilter, resetFilters, toggleArrayFilter, activeFilterCount }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
