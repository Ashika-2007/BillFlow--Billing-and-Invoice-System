import React from 'react';

import {
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend
}) {
  return (
    <div className="stat-card">

      <div className="stat-top">

        <div>
          <div className="muted">
            {label}
          </div>

          <div className="stat-value">
            {value}
          </div>
        </div>

        {Icon && (
          <div className="icon-box">
            <Icon size={19} strokeWidth={2} />
          </div>
        )}

      </div>

      {trend !== undefined && trend !== null && (
        <div
          className={
            trend >= 0
              ? 'trend up'
              : 'trend down'
          }
        >
          {trend >= 0 ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight size={13} />
          )}

          {Math.abs(trend)}% vs last month
        </div>
      )}

    </div>
  );
}