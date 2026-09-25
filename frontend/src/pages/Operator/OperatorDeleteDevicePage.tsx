/**
 * Operator — Delete (Deactivate) / Activate Device (US14 + A1) + Search (A2).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { deviceApi } from '../../api/deviceApi';
import { Device, DeviceState } from '../../types/domain';
import { isApiError } from '../../context/AuthContext';
import DeviceTable from '../../components/devices/DeviceTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import ErrorBanner from '../../components/common/ErrorBanner';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DEBOUNCE_MS = 300;
type ToggleAction = { device: Device; action: 'activate' | 'deactivate' };

export default function OperatorDeleteDevicePage() {
  const [devices, setDevices]               = useState<Device[]>([]);
  const [page, setPage]                     = useState(0);
  const [totalPages, setTotalPages]         = useState(0);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [stateFilter, setStateFilter] = useState<DeviceState>('ACTIVATED');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [toggleTarget, setToggleTarget] = useState<ToggleAction | null>(null);
  const [submitting, setSubmitting]     = useState(false);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(0); setSearchQuery(val.trim()); }, DEBOUNCE_MS);
  };

  const handleStateChange = (state: DeviceState) => {
    setStateFilter(state);
    setPage(0);
    setSearchInput('');
    setSearchQuery('');
  };

  const loadDevices = useCallback(async (targetPage: number, state: DeviceState, query: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await deviceApi.list(targetPage, state, query || undefined);
      const paged = res.data.data;
      setDevices(paged.content);
      setTotalPages(paged.totalPages);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to load devices.');
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDevices(page, stateFilter, searchQuery); }, [page, stateFilter, searchQuery, loadDevices]);

  const handleConfirm = async () => {
    if (!toggleTarget) return;
    setSubmitting(true);
    try {
      const { device, action } = toggleTarget;
      const res = action === 'activate'
        ? await deviceApi.activate({ serialNumber: device.serialNumber })
        : await deviceApi.deactivate({ serialNumber: device.serialNumber });
      setToggleTarget(null);
      setSuccessMessage(res.data.message || `Device ${action}d.`);
      await loadDevices(page, stateFilter, searchQuery);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to update device.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      <ErrorBanner message={successMessage} tone="success" onDismiss={() => setSuccessMessage(null)} />

      <div className="toolbar card" style={{ marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button type="button"
            className={stateFilter === 'ACTIVATED' ? 'btn btn-primary' : 'btn btn-ghost'}
            onClick={() => handleStateChange('ACTIVATED')}>Active</button>
          <button type="button"
            className={stateFilter === 'DEACTIVATED' ? 'btn btn-primary' : 'btn btn-ghost'}
            onClick={() => handleStateChange('DEACTIVATED')}>Deactivated</button>
        </div>
        <div className="field" style={{ marginBottom: 0, flex: 1, maxWidth: 360 }}>
          <label htmlFor="del-device-search">Search serial / IP</label>
          <input id="del-device-search" placeholder="e.g. RT123 or 192.168.1"
            value={searchInput} maxLength={100}
            onChange={(e) => handleSearchChange(e.target.value)} />
        </div>
        {searchQuery && (
          <button type="button" className="btn btn-ghost" style={{ alignSelf: 'flex-end' }}
            onClick={() => { setSearchInput(''); setPage(0); setSearchQuery(''); }}>Clear</button>
        )}
      </div>

      {loading && devices.length === 0 ? <LoadingSpinner label="Loading devices…" /> : (
        <>
          <DeviceTable
            devices={devices}
            onDeactivate={stateFilter === 'ACTIVATED'
              ? (d) => setToggleTarget({ device: d, action: 'deactivate' }) : undefined}
            onActivate={stateFilter === 'DEACTIVATED'
              ? (d) => setToggleTarget({ device: d, action: 'activate' }) : undefined}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.action === 'activate'
          ? `Activate ${toggleTarget?.device.serialNumber ?? ''}?`
          : `Deactivate ${toggleTarget?.device.serialNumber ?? ''}?`}
        description={toggleTarget?.action === 'activate'
          ? 'The device will appear in the active list and its alarms will be visible again.'
          : 'The device record is kept but removed from active monitoring.'}
        confirmLabel={toggleTarget?.action === 'activate' ? 'Activate' : 'Deactivate'}
        destructive={toggleTarget?.action === 'deactivate'}
        busy={submitting}
        onConfirm={handleConfirm}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  );
}
