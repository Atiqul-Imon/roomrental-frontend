'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends { _id?: string; id?: string }>({
  data,
  columns,
  isLoading = false,
  onRowClick,
  emptyMessage = 'No data available',
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-dark-bg-secondary rounded-xl shadow-dark-medium border border-dark-border-default p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-dark-bg-secondary rounded-xl shadow-dark-medium border border-dark-border-default p-12">
        <p className="text-center text-dark-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-dark-bg-secondary rounded-xl shadow-dark-medium border border-dark-border-default overflow-hidden',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-bg-tertiary border-b border-dark-border-default">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-semibold text-dark-text-secondary uppercase',
                    column.sortable && 'cursor-pointer hover:text-primary-400 transition-colors',
                    column.width && `w-[${column.width}]`
                  )}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp className="w-3 h-3 opacity-50" />
                        <ChevronDown className="w-3 h-3 opacity-50 -mt-1" />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border-default">
            {data.map((item, index) => {
              const itemId = item._id || item.id || index.toString();
              return (
                <tr
                  key={itemId}
                  className={cn(
                    'hover:bg-dark-bg-tertiary transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4">
                      {column.render
                        ? column.render(item)
                        : (item as any)[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

