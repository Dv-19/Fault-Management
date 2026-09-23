import React from 'react';
import { severityStyle } from '../../config/severityStyle';

export default function SeverityBadge({ severity }: { severity: string }) {
  const style = severityStyle(severity);
  return (
    <span
      className="severity-badge"
      style={{ color: style.color, backgroundColor: style.background }}
    >
      <span className="severity-dot" aria-hidden="true" />
      {style.label}
    </span>
  );
}
