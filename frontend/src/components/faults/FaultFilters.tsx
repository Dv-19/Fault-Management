import React from 'react';
import { FaultStatus } from '../../types/domain';

export interface FaultFilterState {
  severity: string;
  status: FaultStatus | '';
  search: string;
}

const SEVERITY_OPTIONS = ['', 'CLEAR', 'WARNING', 'MAJOR', 'SEVERE', 'CRITICAL'];
// Terminated is intentionally excluded — the active table must never show
// terminated faults (integration doc, section 8.1).
const STATUS_OPTIONS: (FaultStatus | '')[] = ['', 'OPEN', 'ACKNOWLEDGED', 'CLEARED'];

export default function FaultFilters({
  value,
  onChange,
}: {
  value: FaultFilterState;
  onChange: (next: FaultFilterState) => void;
}) {
  return (
    <div className="toolbar card">
      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="fault-severity">Severity</label>
        <select
          id="fault-severity"
          value={value.severity}
          onChange={(e) => onChange({ ...value, severity: e.target.value })}
        >
          {SEVERITY_OPTIONS.map((s) => (
            <option key={s || 'any'} value={s}>
              {s || 'Any'}
            </option>
          ))}
        </select>
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="fault-status">Status</label>
        <select
          id="fault-status"
          value={value.status}
          onChange={(e) => onChange({ ...value, status: e.target.value as FaultStatus | '' })}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s || 'any'} value={s}>
              {s || 'Any'}
            </option>
          ))}
        </select>
      </div>
      <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
        <label htmlFor="fault-search">Search</label>
        <input
          id="fault-search"
          placeholder="Device IP, serial, alarm name…"
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
        />
      </div>
    </div>
  );
}
