import React from 'react';

export function Skeleton({ width, height = 14, radius, className = '', style }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}

export function TableSkeleton({ columns = 5, rows = 6 }) {
  return (
    <div className="table-wrap" role="status" aria-label="Loading records">
      <table>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((__, c) => (
                <td key={c}>
                  <Skeleton width={c === 0 ? '70%' : `${45 + ((r + c) % 4) * 12}%`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CardSkeleton({ height = 120 }) {
  return <div className="skeleton-card skeleton" style={{ height }} aria-hidden="true" />;
}
