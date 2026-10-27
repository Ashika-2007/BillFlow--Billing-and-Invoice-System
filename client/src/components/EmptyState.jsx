import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No records found.', description, icon: Icon = Inbox, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        <Icon size={22} strokeWidth={1.7} />
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
