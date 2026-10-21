import React from 'react';

import {
  CheckCircle2,
  Clock3,
  AlertCircle,
  Ban,
  CircleDot
} from 'lucide-react';

const config = {
  paid: {
    icon: CheckCircle2,
    label: 'Paid'
  },

  completed: {
    icon: CheckCircle2,
    label: 'Completed'
  },

  active: {
    icon: CheckCircle2,
    label: 'Active'
  },

  pending: {
    icon: Clock3,
    label: 'Pending'
  },

  draft: {
    icon: CircleDot,
    label: 'Draft'
  },

  overdue: {
    icon: AlertCircle,
    label: 'Overdue'
  },

  cancelled: {
    icon: Ban,
    label: 'Cancelled'
  },

  failed: {
    icon: AlertCircle,
    label: 'Failed'
  },

  void: {
    icon: Ban,
    label: 'Void'
  },

  partial: {
    icon: Clock3,
    label: 'Partial'
  }
};

export default function StatusBadge({
  status
}) {
  const key = String(status || '')
    .toLowerCase();

  const item =
    config[key] || {
      icon: CircleDot,
      label: String(status || 'Unknown')
    };

  const Icon = item.icon;

  return (
    <span className={`badge badge-${key}`}>
      <Icon
        size={11}
        strokeWidth={2.4}
      />

      {item.label}
    </span>
  );
}