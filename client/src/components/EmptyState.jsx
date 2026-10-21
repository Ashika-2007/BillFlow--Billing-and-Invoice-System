import React from 'react';
export default function EmptyState({title='No records found.',action}){return <div className="empty-state"><div className="empty-icon">∅</div><h3>{title}</h3>{action}</div>}

