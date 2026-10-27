import React from 'react';
import { CheckCircle2, Clock3, AlertCircle, Ban, CircleDot, PieChart, Send, PauseCircle } from 'lucide-react';

const config = {
  paid: { icon: CheckCircle2, label: 'Paid', tone: 'success' },
  completed: { icon: CheckCircle2, label: 'Completed', tone: 'success' },
  success: { icon: CheckCircle2, label: 'Success', tone: 'success' },
  active: { icon: CheckCircle2, label: 'Active', tone: 'success' },
  inactive: { icon: PauseCircle, label: 'Inactive', tone: 'neutral' },
  pending: { icon: Clock3, label: 'Pending', tone: 'warning' },
  sent: { icon: Send, label: 'Sent', tone: 'violet' },
  draft: { icon: CircleDot, label: 'Draft', tone: 'neutral' },
  overdue: { icon: AlertCircle, label: 'Overdue', tone: 'danger' },
  cancelled: { icon: Ban, label: 'Cancelled', tone: 'muted' },
  failed: { icon: AlertCircle, label: 'Failed', tone: 'danger' },
  void: { icon: Ban, label: 'Void', tone: 'muted' },
  partial: { icon: PieChart, label: 'Partially paid', tone: 'info' },
  partially_paid: { icon: PieChart, label: 'Partially paid', tone: 'info' }
};

export default function StatusBadge({ status }) {
  const key = String(status || '').toLowerCase();
  const item = config[key] || {
    icon: CircleDot,
    label: String(status || 'Unknown').replaceAll('_', ' '),
    tone: 'neutral'
  };
  const Icon = item.icon;
  return (
    <span className={`badge badge-${item.tone}`}>
      <Icon size={12} strokeWidth={2.4} aria-hidden="true" />
      {item.label}
    </span>
  );
}
