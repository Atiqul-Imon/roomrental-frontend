'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
}

export function Pagination({ currentPage, totalPages, total, limit }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/listings?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  return (
    <nav aria-label="Pagination navigation" className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      <div className="text-sm text-grey-600" aria-live="polite">
        Showing {startItem} to {endItem} of {total} results
      </div>

      <div className="flex items-center gap-2" role="group" aria-label="Pagination controls">
        <button
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-grey-300 rounded-lg hover:bg-grey-50 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label="Go to previous page"
          aria-disabled={currentPage === 1}
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex gap-1" role="list">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-grey-400" aria-hidden="true">
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            return (
              <button
                key={pageNum}
                onClick={() => changePage(pageNum)}
                className={`px-4 py-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  currentPage === pageNum
                    ? 'bg-primary-600 text-white font-semibold'
                    : 'border border-grey-300 hover:bg-grey-50 text-grey-700'
                }`}
                aria-label={`Go to page ${pageNum}`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-grey-300 rounded-lg hover:bg-grey-50 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label="Go to next page"
          aria-disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

