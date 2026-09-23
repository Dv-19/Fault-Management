import React from 'react';
import './common.css';

export default function LoadingSpinner({
  label = 'Loading…',
  fullPage = false,
}: {
  label?: string;
  fullPage?: boolean;
}) {
  return (
    <div className={fullPage ? 'spinner-fullpage' : 'spinner-inline'} role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
