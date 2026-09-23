// Colors are explicit SRS behavior (US16): Clear-GREEN, Warning-ORANGE,
// Major-YELLOW, Severe-PURPLE, Critical-RED. Kept in this one file so any
// future change to the mapping never has to touch a component.

export interface SeverityStyle {
  label: string;
  color: string;
  background: string;
}

const KNOWN_STYLES: Record<string, SeverityStyle> = {
  CLEAR: { label: 'Clear', color: '#1f7a4d', background: '#e2f3ea' },
  WARNING: { label: 'Warning', color: '#b56a00', background: '#fbedd0' },
  MAJOR: { label: 'Major', color: '#8a7300', background: '#faf3c2' },
  SEVERE: { label: 'Severe', color: '#6a2fa8', background: '#efe3fa' },
  CRITICAL: { label: 'Critical', color: '#b3261e', background: '#fbe4e2' },
};

const FALLBACK_STYLE: SeverityStyle = {
  label: 'Unknown',
  color: '#3a3f4b',
  background: '#e7e9ee',
};

export function severityStyle(rawValue: string): SeverityStyle {
  const key = rawValue?.toUpperCase?.() ?? '';
  const known = KNOWN_STYLES[key];
  if (known) return known;
  return { ...FALLBACK_STYLE, label: rawValue || 'Unknown' };
}

/** Fixed draw order for report charts/legends, matching the SRS list order. */
export const SEVERITY_ORDER = ['CLEAR', 'WARNING', 'MAJOR', 'SEVERE', 'CRITICAL'];
