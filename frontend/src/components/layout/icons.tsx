import React from 'react';

type IconProps = { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function UsersIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" />
      <circle cx="9" cy="7.5" r="3" />
      <path d="M15.5 6a2.8 2.8 0 0 1 0 5.4" />
      <path d="M20 19v-1.3a3 3 0 0 0-2.2-2.9" />
    </svg>
  );
}

export function ReportIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M5 20V10" />
      <path d="M11 20V4" />
      <path d="M17 20v-7" />
      <path d="M4 20h16" />
    </svg>
  );
}

export function RouterIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <rect x="3.5" y="12" width="17" height="6" rx="1.4" />
      <path d="M7 12V9a5 5 0 0 1 10 0v3" />
      <path d="M7.5 15h.01M11 15h.01" />
    </svg>
  );
}

export function AlarmIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M12 3v3" />
      <path d="M12 20a7 7 0 0 0 7-7c0-3-1.5-4.6-2.4-6.2C15.8 8 14.5 6 12 6s-3.8 2-4.6 3.8C6.5 11.4 5 13 5 16a7 7 0 0 0 7 4Z" />
      <circle cx="12" cy="20" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LockIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="9" rx="1.6" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </svg>
  );
}

export function LogoutIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M9 20H5.6A1.6 1.6 0 0 1 4 18.4V5.6A1.6 1.6 0 0 1 5.6 4H9" />
      <path d="M15.5 16.5 20 12l-4.5-4.5" />
      <path d="M20 12H9" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

/** Sidebar/login brand mark — a simple monogram, not an image asset. */
export function BrandMark({ size = 36 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect x="1" y="1" width="38" height="38" rx="9" fill="var(--color-accent)" />
      <path
        d="M12 28V13.5a1.5 1.5 0 0 1 1.5-1.5H24"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M12 20h8.5" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="27.5" cy="12.5" r="2.6" fill="#ffffff" />
    </svg>
  );
}
