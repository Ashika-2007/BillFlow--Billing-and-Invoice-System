import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

/**
 * KPI card. Pass a numeric `value` (optionally with `format`) to get a count-up,
 * or pass `display` to render pre-formatted content.
 */
export default function StatCard({ label, value, format, display, icon: Icon, trend, hint, tone = 'brand', index = 0 }) {
  return (
    <div className={`stat-card tone-${tone}`} style={{ '--i': index }}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {Icon && (
          <span className="icon-box" aria-hidden="true">
            <Icon size={17} strokeWidth={2} />
          </span>
        )}
      </div>
      <div className="stat-value">
        {display !== undefined ? display : <AnimatedNumber value={value} format={format} />}
      </div>
      {hint && <div className="stat-hint">{hint}</div>}
      {trend !== undefined && trend !== null && (
        <div className={trend >= 0 ? 'trend up' : 'trend down'}>
          {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  );
}
