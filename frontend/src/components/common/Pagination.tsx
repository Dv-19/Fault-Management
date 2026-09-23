import React from 'react';
import './common.css';

interface PaginationProps {
  /** Zero-based current page, as returned by the API. */
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (nextZeroBasedPage: number) => void;
}

export default function Pagination({ page, totalPages, totalElements, onPageChange }: PaginationProps) {
  if (totalElements === 0) return null;

  const displayPage = page + 1; // UI shows 1-based page numbers
  const canGoPrev = page > 0;
  const canGoNext = page + 1 < totalPages;

  return (
    <div className="pagination">
      <span className="pagination-summary">
        Page {displayPage} of {Math.max(totalPages, 1)} · {totalElements} total
      </span>
      <div className="pagination-controls">
        <button type="button" className="btn btn-ghost" disabled={!canGoPrev} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>
        <button type="button" className="btn btn-ghost" disabled={!canGoNext} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
