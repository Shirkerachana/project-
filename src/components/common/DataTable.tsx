import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  filterComponent?: React.ReactNode;
  pageSize?: number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  selectedIds?: string[];
  onSelectToggle?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
  bulkActions?: React.ReactNode;
}

export function DataTable<T>({
  columns = [],
  data = [],
  keyExtractor,
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchFilter,
  filterComponent,
  pageSize = 10,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search query or filters.',
  onRowClick,
  selectedIds,
  onSelectToggle,
  onSelectAll,
  bulkActions
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const safeColumns = useMemo(() => (Array.isArray(columns) ? columns : []), [columns]);

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !searchFilter) return safeData;
    return safeData.filter((item) => searchFilter(item, searchQuery.toLowerCase().trim()));
  }, [safeData, searchQuery, searchFilter]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a: any, b: any) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      return sortDirection === 'asc' ? 1 : -1;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalItems = sortedData?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return (sortedData || []).slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const isAllSelected =
    selectedIds &&
    (paginatedData?.length || 0) > 0 &&
    paginatedData.every((item) => selectedIds.includes(keyExtractor(item)));

  const colSpanCount = (safeColumns?.length || 0) + (selectedIds ? 1 : 0);

  return (
    <div id="data-table-container" className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {searchable && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            />
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {filterComponent}
          {selectedIds && selectedIds.length > 0 && bulkActions}
        </div>
      </div>

      {/* Main Table Layout */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 shadow-sm">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              {selectedIds && onSelectAll && (
                <th className="px-4 py-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={() => {
                      if (isAllSelected) {
                        onSelectAll([]);
                      } else {
                        onSelectAll(paginatedData.map(keyExtractor));
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
              )}

              {safeColumns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={`px-4 py-3.5 font-semibold ${
                    col.sortable ? 'cursor-pointer select-none hover:text-white transition-colors' : ''
                  } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${
                    col.className || ''
                  }`}
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.key && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={colSpanCount} className="p-8">
                  <LoadingState message="Fetching table data..." />
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={colSpanCount} className="p-8">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const id = keyExtractor(item);
                const isSelected = selectedIds?.includes(id);

                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick?.(item)}
                    className={`transition-colors ${
                      onRowClick ? 'cursor-pointer hover:bg-slate-800/40' : ''
                    } ${isSelected ? 'bg-indigo-950/20' : ''}`}
                  >
                    {selectedIds && onSelectToggle && (
                      <td
                        className="px-4 py-3.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectToggle(id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                    )}

                    {safeColumns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3.5 ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        } ${col.className || ''}`}
                      >
                        {col.render ? col.render(item) : (item as any)[col.key] || '—'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && totalItems > pageSize && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-400">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-medium text-slate-200">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
