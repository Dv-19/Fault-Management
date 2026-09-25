/**
 * Fault/Alarm table (US16–US19).
 *
 * Row background color-coded by severity (SRS US16).
 * A3: expandable audit row shows who acknowledged/cleared/terminated and when.
 */
import React, { useState } from 'react';
import { Alarm, parseJavaDateTime } from '../../types/domain';
import { alarmActions, faultApi } from '../../api/faultApi';
import { isApiError } from '../../context/AuthContext';
import SeverityBadge from './SeverityBadge';
import { severityStyle } from '../../config/severityStyle';

interface FaultTableProps {
  alarms: Alarm[];
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onAcknowledge: (alarm: Alarm) => void;
  onClear: (alarm: Alarm) => void;
  onTerminate: (alarm: Alarm) => void;
  onNotesUpdated?: () => void;
}

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  UNACKNOWLEDGED: { background: 'var(--color-danger-bg)',  color: 'var(--color-danger)'     },
  ACKNOWLEDGED:   { background: 'var(--color-warning-bg)', color: 'var(--color-warning)'    },
  CLEARED:        { background: 'var(--color-success-bg)', color: 'var(--color-success)'    },
  TERMINATED:     { background: '#eceff2',                 color: 'var(--color-text-muted)' },
};

// ── Notes inline editor ──────────────────────────────────────────────────────

interface NotesEditorProps {
  alarmId: number;
  currentNotes: string | null;
  onSaved: () => void;
}

function NotesEditor({ alarmId, currentNotes, onSaved }: NotesEditorProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue]     = useState(currentNotes ?? '');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  if (!editing) {
    return (
      <span
        style={{ cursor: 'pointer', color: currentNotes ? 'inherit' : 'var(--color-text-muted)' }}
        title="Click to edit notes"
        onClick={() => { setValue(currentNotes ?? ''); setEditing(true); setError(null); }}
      >
        {currentNotes || <em>Add notes</em>}
      </span>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await faultApi.updateNotes(alarmId, value);
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Could not save notes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 180 }}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        style={{ font: 'inherit', fontSize: '0.82rem', padding: '4px 6px',
                 border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                 resize: 'vertical', maxWidth: 240 }}
        maxLength={1000}
        autoFocus
      />
      {error && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{error}</span>}
      <div style={{ display: 'flex', gap: 4 }}>
        <button type="button" className="btn btn-primary btn-small" disabled={saving} onClick={handleSave}>
          {saving ? '…' : 'Save'}
        </button>
        <button type="button" className="btn btn-ghost btn-small" disabled={saving}
          onClick={() => { setEditing(false); setError(null); }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── A3: Audit detail row ─────────────────────────────────────────────────────

function formatAuditTime(value: import('../../types/domain').JavaLocalDateTime): string {
  const d = parseJavaDateTime(value);
  if (!d) return '—';
  try {
    return d.toLocaleString([], {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch {
    return String(value);
  }
}

function AuditRow({ alarm, colSpan }: { alarm: Alarm; colSpan: number }) {
  const hasAny = alarm.acknowledgedBy || alarm.clearedBy || alarm.terminatedBy;
  return (
    <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
      <td colSpan={colSpan} style={{ padding: '8px 20px 12px 36px' }}>
        {hasAny ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            {alarm.acknowledgedBy && (
              <span>
                <strong style={{ color: 'var(--color-warning)' }}>Acknowledged</strong>{' '}
                by <strong>{alarm.acknowledgedBy}</strong> at {formatAuditTime(alarm.acknowledgedAt)}
              </span>
            )}
            {alarm.clearedBy && (
              <span>
                <strong style={{ color: 'var(--color-success)' }}>Cleared</strong>{' '}
                by <strong>{alarm.clearedBy}</strong> at {formatAuditTime(alarm.clearedAt)}
              </span>
            )}
            {alarm.terminatedBy && (
              <span>
                <strong style={{ color: 'var(--color-text-muted)' }}>Terminated</strong>{' '}
                by <strong>{alarm.terminatedBy}</strong> at {formatAuditTime(alarm.terminatedAt)}
              </span>
            )}
          </div>
        ) : (
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            No audit history yet.
          </span>
        )}
      </td>
    </tr>
  );
}

// ── Main table ────────────────────────────────────────────────────────────────

const COL_COUNT = 11; // including expand toggle column

export default function FaultTable({
  alarms,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onAcknowledge,
  onClear,
  onTerminate,
  onNotesUpdated,
}: FaultTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (alarms.length === 0) {
    return <div className="empty-state">No alarms match the current filters.</div>;
  }

  const allSelected = alarms.length > 0 && alarms.every((a) => selectedIds.has(a.id));

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 32 }} />
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                aria-label="Select all"
              />
            </th>
            <th>Device IP</th>
            <th>Serial</th>
            <th>Type</th>
            <th>Trap</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Count</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {alarms.map((a) => {
            const { canAcknowledge, canClear, canTerminate } = alarmActions(a.status);
            const isExpanded = expandedIds.has(a.id);

            // Row colour: CLEARED → always green, TERMINATED → always grey,
            // everything else → severity colour (SRS US16 + US18).
            let rowBg: string;
            let rowBorder: string;
            if (a.status === 'CLEARED') {
              rowBg     = 'var(--color-success-bg)';
              rowBorder = 'var(--color-success)';
            } else if (a.status === 'TERMINATED') {
              rowBg     = '#f0f2f5';
              rowBorder = '#9ca3af';
            } else {
              const sev = severityStyle(a.severity);
              rowBg     = sev.background;
              rowBorder = sev.color;
            }

            const rowStyle: React.CSSProperties = {
              backgroundColor: rowBg,
              borderLeft: `4px solid ${rowBorder}`,
            };

            return (
              <React.Fragment key={a.id}>
                <tr style={rowStyle}>
                  {/* A3 expand toggle */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => toggleExpand(a.id)}
                      aria-label={isExpanded ? 'Hide audit trail' : 'Show audit trail'}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '0.72rem', color: 'var(--color-text-muted)',
                        padding: '2px 4px', borderRadius: 'var(--radius-sm)',
                        transition: 'transform 150ms',
                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                      }}
                    >
                      ▶
                    </button>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(a.id)}
                      onChange={() => onToggleSelect(a.id)}
                      aria-label={`Select alarm ${a.id}`}
                    />
                  </td>
                  <td className="mono">{a.deviceIp}</td>
                  <td className="mono">{a.serialNumber}</td>
                  <td>{a.deviceType}</td>
                  <td className="mono" style={{ fontSize: '0.78em', whiteSpace: 'nowrap' }}>{a.trap}</td>
                  <td><SeverityBadge severity={a.severity} /></td>
                  <td>
                    <span className="state-tag" style={STATUS_STYLE[a.status] ?? {}}>
                      {a.status}
                    </span>
                  </td>
                  <td>{a.occurrence}</td>
                  <td style={{ maxWidth: 200 }}>
                    <NotesEditor
                      alarmId={a.id}
                      currentNotes={a.notes}
                      onSaved={onNotesUpdated ?? (() => {})}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-small"
                        disabled={!canAcknowledge}
                        onClick={() => onAcknowledge(a)}
                      >
                        Ack
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-small"
                        disabled={!canClear}
                        onClick={() => onClear(a)}
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-small"
                        disabled={!canTerminate}
                        onClick={() => onTerminate(a)}
                      >
                        Terminate
                      </button>
                    </div>
                  </td>
                </tr>

                {/* A3 — audit detail row */}
                {isExpanded && <AuditRow alarm={a} colSpan={COL_COUNT} />}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
