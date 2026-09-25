/**
 * Fault filter bar.
 * Integration doc §7.2:
 *  - All filters combine with AND.
 *  - Default (no status filter) hides TERMINATED alarms.
 *  - Pass status=TERMINATED to reveal them.
 *  - Omit a filter entirely (don't send empty string) — handled in ManagerFaultsPage.
 *
 * Enum values populated from dropdowns only to avoid 500s from unknown enum strings.
 */
import React from 'react';
import { AlarmStatus, Severity } from '../../types/domain';

export interface FaultFilterState {
  deviceIp: string;
  severity: Severity | '';
  /** Empty string = default (TERMINATED hidden). 'TERMINATED' reveals them. */
  status: AlarmStatus | '';
}

const SEVERITY_OPTIONS: (Severity | '')[] = ['', 'CLEAR', 'WARNING', 'MAJOR', 'SEVERE', 'CRITICAL'];
const STATUS_OPTIONS: (AlarmStatus | '')[] = [
  '',
  'UNACKNOWLEDGED',
  'ACKNOWLEDGED',
  'CLEARED',
  'TERMINATED',
];

export default function FaultFilters({
  value,
  onChange,
}: {
  value: FaultFilterState;
  onChange: (next: FaultFilterState) => void;
}) {
  return (
    <div className="toolbar card" style={{ marginBottom: 'var(--space-4)' }}>
      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="filter-ip">Device IP</label>
        <input
          id="filter-ip"
          placeholder="e.g. 192.168.1.10"
          value={value.deviceIp}
          onChange={(e) => onChange({ ...value, deviceIp: e.target.value })}
        />
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="filter-severity">Severity</label>
        <select
          id="filter-severity"
          value={value.severity}
          onChange={(e) => onChange({ ...value, severity: e.target.value as Severity | '' })}
        >
          {SEVERITY_OPTIONS.map((s) => (
            <option key={s || 'any'} value={s}>
              {s || 'Any'}
            </option>
          ))}
        </select>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="filter-status">Status</label>
        <select
          id="filter-status"
          value={value.status}
          onChange={(e) => onChange({ ...value, status: e.target.value as AlarmStatus | '' })}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s || 'default'} value={s}>
              {s === '' ? 'Active (excl. Terminated)' : s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
