import React from 'react';
import './common.css';

interface LoadingSpinnerProps {
  label?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({
  label = 'Loading…',
  fullPage = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className="spinner-wrap" aria-live="polite" aria-label={label}>
      <span className="spinner" aria-hidden="true" />
      <span className="spinner-label">{label}</span>
    </div>
  );

  if (fullPage) {
    return <div className="spinner-fullpage">{content}</div>;
  }

  return content;
}
