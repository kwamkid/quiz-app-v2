import { useMemo } from 'react';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const btnBase = {
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '8px',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  transition: 'background 0.2s',
  cursor: 'pointer',
};

export default function Pagination({
  totalItems,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  lang = 'th',
}) {
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / rowsPerPage)), [totalItems, rowsPerPage]);

  // Show: [prev] [current] [next] ... [lastPage-1] [lastPage]
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const prev = currentPage - 1;
    const next = currentPage + 1;

    // Group 1: prev, current, next
    if (prev >= 1) pages.push(prev);
    pages.push(currentPage);
    if (next <= totalPages) pages.push(next);

    // Group 2: last 2 pages
    const lastTwo = [totalPages - 1, totalPages];
    const lastInGroup1 = pages[pages.length - 1];

    // Add "..." if there's a gap
    if (lastTwo[0] > lastInGroup1 + 1) {
      pages.push('...');
    }

    for (const p of lastTwo) {
      if (p > lastInGroup1) pages.push(p);
    }

    return pages;
  }, [currentPage, totalPages]);

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  const navBtn = (disabled) => ({
    ...btnBase,
    color: disabled ? 'rgba(255,255,255,0.25)' : 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
  });

  const hoverIn = (e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; };
  const hoverOut = (e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; };

  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* Info + Rows/Page */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
          {lang === 'th'
            ? `แสดง ${startItem}–${endItem} จาก ${totalItems} รายการ`
            : `Showing ${startItem}–${endItem} of ${totalItems}`}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
            {lang === 'th' ? 'แถว/หน้า' : 'Rows'}:
          </span>
          <SearchableDropdown
            value={rowsPerPage}
            onChange={(val) => onRowsPerPageChange(val)}
            options={PAGE_SIZE_OPTIONS.map(n => ({ value: n, label: String(n) }))}
            style={{ width: '72px', padding: '6px 10px', fontSize: '0.85rem', minWidth: 'auto' }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* First */}
        <button onClick={() => onPageChange(1)} disabled={isFirst} style={navBtn(isFirst)}
          onMouseEnter={!isFirst ? hoverIn : undefined} onMouseLeave={hoverOut}>
          <ChevronsLeft size={16} />
        </button>

        {/* Prev */}
        <button onClick={() => onPageChange(currentPage - 1)} disabled={isFirst} style={navBtn(isFirst)}
          onMouseEnter={!isFirst ? hoverIn : undefined} onMouseLeave={hoverOut}>
          <ChevronLeft size={16} />
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((page, idx) => {
          if (page === '...') {
            return (
              <span key={`dots-${idx}`} style={{ color: 'rgba(255,255,255,0.4)', padding: '0 4px', fontSize: '0.9rem', userSelect: 'none' }}>
                ...
              </span>
            );
          }
          const active = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              style={{
                ...btnBase,
                padding: '8px 12px',
                fontSize: '0.85rem',
                minWidth: '36px',
                justifyContent: 'center',
                color: 'white',
                fontWeight: active ? 'bold' : 'normal',
                background: active ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : btnBase.background,
                border: active ? '1px solid #8b5cf6' : btnBase.border,
                boxShadow: active ? '0 2px 8px rgba(139, 92, 246, 0.4)' : 'none',
              }}
              onMouseEnter={!active ? hoverIn : undefined}
              onMouseLeave={!active ? hoverOut : undefined}
            >
              {page}
            </button>
          );
        })}

        {/* Next */}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={isLast} style={navBtn(isLast)}
          onMouseEnter={!isLast ? hoverIn : undefined} onMouseLeave={hoverOut}>
          <ChevronRight size={16} />
        </button>

        {/* Last */}
        <button onClick={() => onPageChange(totalPages)} disabled={isLast} style={navBtn(isLast)}
          onMouseEnter={!isLast ? hoverIn : undefined} onMouseLeave={hoverOut}>
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
