import React from 'react';
import { TableSkeleton } from './Skeleton';

/**
 * Shared data table.
 * columns: [{ key, label, align?: 'right'|'center', className?, render?(row, index) }]
 */
export default function DataTable({
  columns,
  rows,
  loading,
  empty = <div className="table-empty">No records found.</div>,
  rowKey = (row, i) => row._id || i,
  caption
}) {
  if (loading) return <TableSkeleton columns={columns.length} />;
  if (!rows?.length) return empty;
  return (
    <div className="table-wrap">
      <table>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={[c.align && `align-${c.align}`, c.className].filter(Boolean).join(' ')}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey(row, i)} className="row-in" style={{ '--i': i }}>
              {columns.map((c) => (
                <td key={c.key} className={[c.align && `align-${c.align}`, c.className].filter(Boolean).join(' ')}>
                  {c.render ? c.render(row, i) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
