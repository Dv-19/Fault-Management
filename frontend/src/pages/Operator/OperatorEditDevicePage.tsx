import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deviceApi } from '../../api/deviceApi';
import { Device, PageResponse } from '../../types/domain';
import { isApiError } from '../../context/AuthContext';
import DeviceTable from '../../components/devices/DeviceTable';
import EditDeviceDialog from '../../components/devices/EditDeviceDialog';
import Pagination from '../../components/common/Pagination';
import ErrorBanner from '../../components/common/ErrorBanner';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PAGE_SIZE = 10;

export default function OperatorEditDevicePage() {
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PageResponse<Device> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Device | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});

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

  const handleConfirmEdit = async (originalSerialNumber: string, newSerialNumber: string, newIp: string) => {
    setEditSubmitting(true);
    setEditFieldErrors({});
    try {
      const payload = newSerialNumber !== originalSerialNumber
        ? { serialNumber: newSerialNumber, ipAddress: newIp }
        : { ipAddress: newIp };
      await deviceApi.edit(originalSerialNumber, payload);
      // US13: "navigate to the device list page[US11] automatically."
      navigate('/operator/devices', { replace: true, state: { message: 'Device updated successfully' } });
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message);
        setEditFieldErrors(err.fieldErrors ?? {});
      } else {
        setError('Unable to update device.');
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Edit device</h1>
      </div>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      {loading && !pageData ? (
        <LoadingSpinner label="Loading devices…" />
      ) : (
        <>
          <DeviceTable
            devices={pageData?.content ?? []}
            onEdit={(d) => {
              setEditFieldErrors({});
              setEditTarget(d);
            }}
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

      <EditDeviceDialog
        device={editTarget}
        submitting={editSubmitting}
        fieldErrors={editFieldErrors}
        onConfirm={handleConfirmEdit}
        onCancel={() => setEditTarget(null)}
      />
    </div>
  );
}
