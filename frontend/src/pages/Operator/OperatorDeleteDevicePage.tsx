import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deviceApi } from '../../api/deviceApi';
import { Device, PageResponse } from '../../types/domain';
import { isApiError } from '../../context/AuthContext';
import DeviceTable from '../../components/devices/DeviceTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import ErrorBanner from '../../components/common/ErrorBanner';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PAGE_SIZE = 10;

export default function OperatorDeleteDevicePage() {
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PageResponse<Device> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [target, setTarget] = useState<Device | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadDevices = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await deviceApi.list({ page: targetPage, size: PAGE_SIZE, state: 'ACTIVATED' });
      setPageData(data);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to load devices.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices(page);
  }, [page, loadDevices]);

  const handleConfirm = async () => {
    if (!target) return;
    setSubmitting(true);
    try {
      await deviceApi.deactivate(target.serialNumber);
      setTarget(null);
      // US14: "navigate to the device list page[US11] automatically where
      // the deleted/deactivated device should be removed from the list."
      navigate('/operator/devices', { replace: true, state: { message: 'Device deactivated successfully' } });
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to deactivate device.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Delete device</h1>
      </div>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      {loading && !pageData ? (
        <LoadingSpinner label="Loading devices…" />
      ) : (
        <>
          <DeviceTable devices={pageData?.content ?? []} onDeactivate={setTarget} />
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
        open={!!target}
        title={`Deactivate ${target?.serialNumber ?? ''}?`}
        description="The device record is kept, but it's removed from the active device list."
        confirmLabel="Deactivate"
        destructive
        busy={submitting}
        onConfirm={handleConfirm}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
