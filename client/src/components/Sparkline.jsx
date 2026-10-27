import React, { useId } from 'react';

/** Tiny dependency-free area sparkline drawn from real series values */
export default function Sparkline({ values = [], width = 240, height = 56 }) {
  const id = useId();
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pad = 4;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * width,
    height - pad - ((v - min) / span) * (height - pad * 2)
  ]);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path className="sparkline-line" d={line} fill="none" stroke="#5eead4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" pathLength="1" />
    </svg>
  );
}
