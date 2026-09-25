/**
 * Manager — Fault Handling (US15–US19).
 *
 * Live updates via smart polling (every 15 s).
 *   • Completely silent — no spinner, no controls shown to user.
 *   • Selected rows preserved across polls (keyed by alarm id).
 *   • Pauses automatically while a confirm dialog is open.
 *   • 401 on any fetch → redirect to login.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { faultApi, ListAlarmsParams } from '../../api/faultApi';
import { Alarm, AlarmStatus, Severity } from '../../types/domain';
import { isApiError } from '../../context/AuthContext';
import FaultFilters, { FaultFilterState } from '../../components/faults/FaultFilters';
import FaultTable from '../../components/faults/FaultTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import ErrorBanner from '../../components/common/ErrorBanner';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const POLL_MS = 15_000;

type LifecycleAction = 'acknowledge' | 'clear' | 'terminate';
type BulkAction      = 'acknowledge' | 'clear';
interface PendingSingle { type: LifecycleAction; alarm: Alarm; }

export default function ManagerFaultsPage() {
  const navigate = useNavigate();

  const [filters, setFilters]       = useState<FaultFilterState>({ deviceIp: '', severity: '', status: '' });
  const [page, setPage]             = useState(0);
  const [alarms, setAlarms]         = useState<Alarm[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed]   = useState<Date | null>(null);

  const [selectedIds, setSelectedIds]     = useState<Set<number>>(new Set());
  const [pendingSingle, setPendingSingle] = useState<PendingSingle | null>(null);
  const [pendingBulk, setPendingBulk]     = useState<BulkAction | null>(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // stable refs so the poll timer always reads the latest page/filters
  const pageRef    = useRef(page);
  const filtersRef = useRef(filters);
  useEffect(() => { pageRef.current    = page;    }, [page]);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  const dialogOpen = !!pendingSingle || !!pendingBulk;

  // ── Load alarms ───────────────────────────────────────────────────────────

  const loadAlarms = useCallback(async (targetPage: number, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const f = filtersRef.current;
      const params: ListAlarmsParams = { page: targetPage };
      if (f.deviceIp) params.deviceIp = f.deviceIp;
      if (f.severity) params.severity = f.severity as Severity;
      if (f.status)   params.status   = f.status   as AlarmStatus;

      const res   = await faultApi.list(params);
      const paged = res.data.data;
      setAlarms(paged.content);
      setTotalPages(paged.totalPages);
      setLastRefreshed(new Date());
    } catch (err) {
      if (isApiError(err) && err.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      // Only surface errors on the initial / manual load, swallow background poll errors silently
      if (showSpinner) {
        setError(isApiError(err) ? err.message : 'Unable to load alarms.');
        setAlarms([]);
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset to page 0 when filters change
  useEffect(() => { setPage(0); }, [filters]);

  // Initial + filter/page-driven load
  useEffect(() => { loadAlarms(page); }, [page, loadAlarms, filters]);

  // ── Smart poll ────────────────────────────────────────────────────────────
  // Each successful load schedules the next one after POLL_MS.
  // Pauses while a dialog is open so the table doesn't jump mid-action.

  useEffect(() => {
    if (dialogOpen) return;

    const timer = setTimeout(() => {
      loadAlarms(pageRef.current, false);
    }, POLL_MS);

    return () => clearTimeout(timer);
  }, [dialogOpen, loadAlarms, lastRefreshed]); // re-arms after every completed fetch

  // ── Selection ─────────────────────────────────────────────────────────────

  const toggleSelect = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSelectAll = () =>
    setSelectedIds((prev) => {
      const allSel = alarms.length > 0 && alarms.every((a) => prev.has(a.id));
      return allSel ? new Set() : new Set(alarms.map((a) => a.id));
    });

  const selectedAlarms     = alarms.filter((a) => selectedIds.has(a.id));
  const canBulkAcknowledge = selectedIds.size > 0 && selectedAlarms.every((a) => a.status === 'UNACKNOWLEDGED');
  const canBulkClear       = selectedIds.size > 0 && selectedAlarms.every((a) => a.status === 'ACKNOWLEDGED');

  // ── Single action ─────────────────────────────────────────────────────────

  const handleConfirmSingle = async () => {
    if (!pendingSingle) return;
    setActionSubmitting(true);
    try {
      const { type, alarm } = pendingSingle;
      let res;
      if (type === 'acknowledge') res = await faultApi.acknowledge(alarm.id);
      else if (type === 'clear')  res = await faultApi.clear(alarm.id);
      else                        res = await faultApi.terminate(alarm.id);
      setPendingSingle(null);
      setSuccessMessage(res.data.message);
      await loadAlarms(page);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to complete that action.');
    } finally {
      setActionSubmitting(false);
    }
  };

  // ── Bulk action ───────────────────────────────────────────────────────────

  const handleConfirmBulk = async () => {
    if (!pendingBulk) return;
    setActionSubmitting(true);
    const ids = Array.from(selectedIds);
    try {
      const res = pendingBulk === 'acknowledge'
        ? await faultApi.bulkAcknowledge(ids)
        : await faultApi.bulkClear(ids);
      setPendingBulk(null);
      setSuccessMessage(res.data.message || 'Bulk action completed.');
      await loadAlarms(page);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to complete the bulk action.');
    } finally {
      setActionSubmitting(false);
    }
  };

  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      <ErrorBanner message={successMessage} tone="success" onDismiss={() => setSuccessMessage(null)} />

      {/* Subtle live indicator — mimics SSE feel */}
      <div className="live-indicator">
        <span className="live-indicator-dot" />
        <span>Live</span>
        {lastRefreshed && (
          <span className="live-indicator-time">
            · updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>

      <FaultFilters value={filters} onChange={(next) => setFilters(next)} />

      {/* Bulk toolbar */}
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <span className="field-hint">{selectedIds.size} selected</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-ghost"
            disabled={!canBulkAcknowledge}
            title={!canBulkAcknowledge ? 'Select only UNACKNOWLEDGED alarms' : undefined}
            onClick={() => setPendingBulk('acknowledge')}>
            Acknowledge selected
          </button>
          <button type="button" className="btn btn-ghost"
            disabled={!canBulkClear}
            title={!canBulkClear ? 'Select only ACKNOWLEDGED alarms' : undefined}
            onClick={() => setPendingBulk('clear')}>
            Clear selected
          </button>
        </div>
      </div>

      {loading && alarms.length === 0 ? (
        <LoadingSpinner label="Loading alarms…" />
      ) : (
        <>
          <FaultTable
            alarms={alarms}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onAcknowledge={(a) => setPendingSingle({ type: 'acknowledge', alarm: a })}
            onClear={(a) => setPendingSingle({ type: 'clear', alarm: a })}
            onTerminate={(a) => setPendingSingle({ type: 'terminate', alarm: a })}
            onNotesUpdated={() => loadAlarms(page, false)}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!pendingSingle}
        title={`${cap(pendingSingle?.type ?? '')} this alarm?`}
        description={pendingSingle
          ? `${pendingSingle.alarm.trap} on ${pendingSingle.alarm.deviceIp} (${pendingSingle.alarm.serialNumber})`
          : undefined}
        confirmLabel={cap(pendingSingle?.type ?? '')}
        busy={actionSubmitting}
        onConfirm={handleConfirmSingle}
        onCancel={() => setPendingSingle(null)}
      />

      <ConfirmDialog
        open={!!pendingBulk}
        title={`${cap(pendingBulk ?? '')} ${selectedIds.size} alarm(s)?`}
        description="This action applies to every selected alarm. It is all-or-nothing."
        confirmLabel={cap(pendingBulk ?? '')}
        busy={actionSubmitting}
        onConfirm={handleConfirmBulk}
        onCancel={() => setPendingBulk(null)}
      />
    </div>
  );
}

function cap(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
