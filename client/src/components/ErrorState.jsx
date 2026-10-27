import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorState({ message = 'Unable to load data. Please try again.', onRetry }) {
  return (
    <div className="error-state" role="alert">
      <div className="error-icon" aria-hidden="true">
        <AlertTriangle size={20} />
      </div>
      <strong>{message}</strong>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          <RotateCcw size={15} aria-hidden="true" /> Try again
        </button>
      )}
    </div>
  );
}
