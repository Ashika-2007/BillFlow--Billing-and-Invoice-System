import React from 'react';
export default function QuickActions({onSelect}){return <div className="quick-actions">{['View overdue invoices','Show pending payments','Today’s summary','Recent invoices','Revenue this month','Outstanding balance'].map(x=><button key={x} onClick={()=>onSelect(x)}>{x}</button>)}</div>}

