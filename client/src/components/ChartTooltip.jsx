import React from 'react';

/** Recharts tooltip styled to match the design system */
export default function ChartTooltip({ active, payload, label, formatter, labelFormatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{labelFormatter ? labelFormatter(label) : label}</div>
      {payload.map((p) => (
        <div className="chart-tooltip-row" key={p.dataKey || p.name}>
          <i style={{ background: p.color || p.payload?.fill }} />
          <span>{p.name}</span>
          <strong>{formatter ? formatter(p.value, p) : p.value}</strong>
        </div>
      ))}
    </div>
  );
}
