import React from 'react';
import { Fault } from '../../types/domain';
import SeverityBadge from './SeverityBadge';

interface FaultTableProps {
  faults: Fault[];
  selectedIds: Set<number>;
  onToggleSelect: (faultId: number) => void;
  onToggleSelectAll: () => void;
  onAcknowledge: (fault: Fault) => void;
  onClear: (fault: Fault) => void;
  onTerminate: (fault: Fault) => void;
}

/**
 * Action buttons are enabled purely from the backend's canAcknowledge /
 * canClear / canTerminate flags — no client-side status-machine logic is
 * duplicated here (integration doc, section 8.1).
 */
export default function FaultTable({
  faults,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onAcknowledge,
  onClear,
  onTerminate,
}: FaultTableProps) {
  if (faults.length === 0) {
    return <div className="empty-state">No faults match the current filters.</div>;
  }

  const allSelected = faults.length > 0 && faults.every((f) => selectedIds.has(f.faultId));

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} aria-label="Select all faults" />
            </th>
            <th>Device IP</th>
            <th>Serial</th>
            <th>Type</th>
            <th>Alarm</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Occurrence</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {faults.map((f) => (
            <tr key={f.faultId}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.has(f.faultId)}
                  onChange={() => onToggleSelect(f.faultId)}
                  aria-label={`Select fault ${f.faultId}`}
                />
              </td>
              <td className="mono">{f.deviceIp}</td>
              <td className="mono">{f.deviceSerialNumber}</td>
              <td>{f.deviceType}</td>
              <td className="mono">{f.alarmName}</td>
              <td>
                <SeverityBadge severity={f.severity} />
              </td>
              <td>{f.status}</td>
              <td>{f.occurrence ?? '—'}</td>
              <td>{f.notes || '—'}</td>
              <td>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    disabled={!f.canAcknowledge}
                    onClick={() => onAcknowledge(f)}
                  >
                    Acknowledge
                  </button>
                  <button type="button" className="btn btn-ghost btn-small" disabled={!f.canClear} onClick={() => onClear(f)}>
                    Clear
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    disabled={!f.canTerminate}
                    onClick={() => onTerminate(f)}
                  >
                    Terminate
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
