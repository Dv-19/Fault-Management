import React, { useCallback, useEffect, useState } from 'react';
import { faultApi } from '../../api/faultApi';
import { Fault, PageResponse } from '../../types/domain';
import { isApiError } from '../../context/AuthContext';
import FaultFilters, { FaultFilterState } from '../../components/faults/FaultFilters';
import FaultTable from '../../components/faults/FaultTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import ErrorBanner from '../../components/common/ErrorBanner';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PAGE_SIZE = 20;

type LifecycleAction = 'acknowledge' | 'clear' | 'terminate';
type BulkAction = 'acknowledge' | 'clear';

interface PendingSingleAction {
  type: LifecycleAction;
  fault: Fault;
}

export default function ManagerFaultsPage() {
  const [filters, setFilters] = useState<FaultFilterState>({ severity: '', status: '', search: '' });
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState<PageResponse<Fault> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [pendingSingle, setPendingSingle] = useState<PendingSingleAction | null>(null);
  const [pendingBulk, setPendingBulk] = useState<BulkAction | null>(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const loadFaults = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const data = await faultApi.list({
          page: targetPage,
          size: PAGE_SIZE,
          severity: filters.severity || undefined,
          status: filters.status || undefined,
          search: filters.search || undefined,
        });
        setPageData(data);
        setSelectedIds(new Set());
      } catch (err) {
        setError(isApiError(err) ? err.message : 'Unable to load faults.');
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    setPage(0);
  }, [filters]);

  useEffect(() => {
    loadFaults(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, loadFaults]);

  const faults = pageData?.content ?? [];

  const toggleSelect = (faultId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(faultId)) next.delete(faultId);
      else next.add(faultId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const allSelected = faults.length > 0 && faults.every((f) => prev.has(f.faultId));
      return allSelected ? new Set() : new Set(faults.map((f) => f.faultId));
    });
  };

  const handleConfirmSingle = async () => {
    if (!pendingSingle) return;
    setActionSubmitting(true);
    try {
      const { type, fault } = pendingSingle;
      const res =
        type === 'acknowledge'
          ? await faultApi.acknowledge(fault.faultId)
          : type === 'clear'
          ? await faultApi.clear(fault.faultId)
          : await faultApi.terminate(fault.faultId);
      setPendingSingle(null);
      setSuccessMessage(res.message);
      await loadFaults(page);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to complete that action.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleConfirmBulk = async () => {
    if (!pendingBulk) return;
    setActionSubmitting(true);
    try {
      const ids = Array.from(selectedIds);
      const res = pendingBulk === 'acknowledge' ? await faultApi.bulkAcknowledge(ids) : await faultApi.bulkClear(ids);
      setPendingBulk(null);
      if (res.results) {
        const failed = res.results.filter((r) => !r.success);
        setSuccessMessage(
          failed.length === 0
            ? `${res.results.length} fault(s) updated successfully.`
            : `${res.results.length - failed.length} succeeded, ${failed.length} failed: ${failed
                .map((f) => f.message)
                .join('; ')}`,
        );
      } else {
        setSuccessMessage(res.message ?? 'Bulk action completed.');
      }
      await loadFaults(page);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to complete the bulk action.');
    } finally {
      setActionSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Faults</h1>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      <ErrorBanner message={successMessage} tone="success" onDismiss={() => setSuccessMessage(null)} />

      <FaultFilters value={filters} onChange={setFilters} />

      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <span className="field-hint">{selectedIds.size} selected</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={selectedIds.size === 0}
            onClick={() => setPendingBulk('acknowledge')}
          >
            Acknowledge selected
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={selectedIds.size === 0}
            onClick={() => setPendingBulk('clear')}
          >
            Clear selected
          </button>
        </div>
      </div>

      {loading && !pageData ? (
        <LoadingSpinner label="Loading faults…" />
      ) : (
        <>
          <FaultTable
            faults={faults}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onAcknowledge={(fault) => setPendingSingle({ type: 'acknowledge', fault })}
            onClear={(fault) => setPendingSingle({ type: 'clear', fault })}
            onTerminate={(fault) => setPendingSingle({ type: 'terminate', fault })}
          />
          {pageData && (
            <Pagination
              page={pageData.page}
              totalPages={pageData.totalPages}
              totalElements={pageData.totalElements}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={!!pendingSingle}
        title={`${capitalize(pendingSingle?.type ?? '')} this fault?`}
        description={
          pendingSingle
            ? `${pendingSingle.fault.alarmName} on ${pendingSingle.fault.deviceIp} (${pendingSingle.fault.deviceSerialNumber})`
            : undefined
        }
        confirmLabel={capitalize(pendingSingle?.type ?? '')}
        busy={actionSubmitting}
        onConfirm={handleConfirmSingle}
        onCancel={() => setPendingSingle(null)}
      />

      <ConfirmDialog
        open={!!pendingBulk}
        title={`${capitalize(pendingBulk ?? '')} ${selectedIds.size} fault(s)?`}
        description="This action applies to every selected fault."
        confirmLabel={capitalize(pendingBulk ?? '')}
        busy={actionSubmitting}
        onConfirm={handleConfirmBulk}
        onCancel={() => setPendingBulk(null)}
      />
    </div>
  );
}

function capitalize(value: string): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}
