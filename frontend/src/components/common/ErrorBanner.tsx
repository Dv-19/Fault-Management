import React from 'react';
import './common.css';

export default function ErrorBanner({
  message,
  tone = 'error',
  onDismiss,
}: {
  message: string | null;
  tone?: 'error' | 'success';
  onDismiss?: () => void;
}) {
  if (!message) return null;
  return (
    <div className={`banner banner-${tone}`} role="alert">
      <span>{message}</span>
      {onDismiss && (
        <button type="button" className="banner-dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
