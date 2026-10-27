import React from 'react';

const ACTIONS = [
  'View overdue invoices',
  'Show pending payments',
  'Today’s summary',
  'Recent invoices',
  'Revenue this month',
  'Outstanding balance'
];

export default function QuickActions({ onSelect }) {
  return (
    <div className="quick-actions" role="group" aria-label="Suggested questions">
      {ACTIONS.map((x) => (
        <button key={x} onClick={() => onSelect(x)}>
          {x}
        </button>
      ))}
    </div>
  );
}
