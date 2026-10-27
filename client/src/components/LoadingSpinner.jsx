import React from 'react';

export default function LoadingSpinner({ full = false, label = 'Loading...' }) {
  return (
    <div className={full ? 'loader-full' : 'loader'} role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
