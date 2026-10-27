import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onChange, total, pageSize }) {
  if (pages <= 1) return null;
  const from = total ? (page - 1) * pageSize + 1 : null;
  const to = total ? Math.min(page * pageSize, total) : null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <span className="pagination-info">
        {total ? `Showing ${from}–${to} of ${total}` : `Page ${page} of ${pages}`}
      </span>
      <div className="pagination-controls">
        <button disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="pagination-page">
          {page} / {pages}
        </span>
        <button disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Next page">
          Next <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
