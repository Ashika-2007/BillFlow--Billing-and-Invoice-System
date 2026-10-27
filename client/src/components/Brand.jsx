import React from 'react';

export function BrandMark({ size = 34 }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path d="M10 7.5h8l5 5V24a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 9 24V9a1.5 1.5 0 0 1 1-1.5Z" fill="#fff" />
      <path d="M18 7.5v4a1 1 0 0 0 1 1h4" fill="#a7e3d6" />
      <path d="M12.5 17.5h7M12.5 20.5h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Brand({ subtitle, size }) {
  return (
    <div className="brand">
      <BrandMark size={size} />
      <div className="brand-text">
        <strong>BillFlow</strong>
        {subtitle && <small>{subtitle}</small>}
      </div>
    </div>
  );
}
