import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

function DataTable<T>({ 
  data, 
  columns, 
  onRowClick, 
  keyExtractor,
  emptyMessage = 'No data found',
  isLoading = false
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = (a as any)[sortKey];
      const bVal = (b as any)[sortKey];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  }, [data, sortKey, sortDirection]);

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ChevronsUpDown className="w-4 h-4 text-muted-foreground/50" />;
    if (sortDirection === 'asc') return <ChevronUp className="w-4 h-4 text-primary" />;
    return <ChevronDown className="w-4 h-4 text-primary" />;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 font-semibold text-muted-foreground bg-muted/30",
                  column.align === 'right' && 'text-right',
                  column.align === 'center' && 'text-center',
                  column.sortable && 'cursor-pointer hover:bg-muted/50 select-none',
                  column.width
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className={cn(
                  "flex items-center gap-1",
                  column.align === 'right' && 'justify-end',
                  column.align === 'center' && 'justify-center'
                )}>
                  {column.header}
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                className="px-4 py-12 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "border-b border-border/50 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-muted/30"
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-4 py-3",
                      column.align === 'right' && 'text-right',
                      column.align === 'center' && 'text-center'
                    )}
                  >
                    {column.render 
                      ? column.render(item) 
                      : (item as any)[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
