/**
 * Pagination with page-window navigation.
 *
 * Shows: « Prev  [1] … [4] [5] [6] … [12]  Next »
 * Window of WINDOW_SIZE pages centred on the current page.
 * Always shows first and last page; inserts "…" when there are gaps.
 */
import React from 'react';
import './common.css';

const WINDOW_SIZE = 5; // odd number keeps current page centred

interface PaginationProps {
  page: number;       // zero-based
  totalPages: number;
  onPageChange: (nextPage: number) => void;
}

/** Build the list of page numbers (1-based) and gap markers to render. */
function buildWindow(current0: number, total: number): (number | '…')[] {
  if (total <= 1) return [];

  // For small totals show everything
  if (total <= WINDOW_SIZE + 2) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const cur  = current0 + 1; // 1-based
  const half = Math.floor(WINDOW_SIZE / 2);

  // Slide the window so it's always WINDOW_SIZE wide, clamped inside [2, total-1]
  let winStart = cur - half;
  let winEnd   = cur + half;

  if (winStart < 2) {
    winStart = 2;
    winEnd   = winStart + WINDOW_SIZE - 1;
  }
  if (winEnd > total - 1) {
    winEnd   = total - 1;
    winStart = winEnd - WINDOW_SIZE + 1;
  }
  // Safety clamp
  winStart = Math.max(2, winStart);
  winEnd   = Math.min(total - 1, winEnd);

  const pages: (number | '…')[] = [1];
  if (winStart > 2)       pages.push('…');
  for (let p = winStart; p <= winEnd; p++) pages.push(p);
  if (winEnd < total - 1) pages.push('…');
  pages.push(total);

  return pages;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null; // nothing to paginate

  const isFirst = page === 0;
  const isLast  = page >= totalPages - 1;
  const window  = buildWindow(page, totalPages);

  return (
    <div className="pagination">
      <span className="pagination-summary">
        Page {page + 1} of {totalPages}
      </span>

      <div className="pagination-controls">
        {/* ← Prev */}
        <button
          type="button"
          className="btn btn-ghost pagination-btn"
          disabled={isFirst}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          ‹ Prev
        </button>

        {/* Page number buttons */}
        {window.map((item, idx) =>
          item === '…' ? (
            <span key={`gap-${idx}`} className="pagination-gap">…</span>
          ) : (
            <button
              key={item}
              type="button"
              className={`btn pagination-btn ${item === page + 1 ? 'pagination-btn--active' : 'btn-ghost'}`}
              onClick={() => onPageChange((item as number) - 1)}
              aria-label={`Page ${item}`}
              aria-current={item === page + 1 ? 'page' : undefined}
            >
              {item}
            </button>
          )
        )}

        {/* Next → */}
        <button
          type="button"
          className="btn btn-ghost pagination-btn"
          disabled={isLast}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
