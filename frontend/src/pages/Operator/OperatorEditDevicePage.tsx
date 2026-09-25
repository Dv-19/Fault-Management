/**
 * Operator — Edit Device (US13).
 * PUT /api/devices  body: { serialNumber, newIpAddress }
 * Only the IP can be changed — serial is the lookup key, type is read-only.
 * Response carries no device payload — re-fetch the list after success.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deviceApi } from '../../api/deviceApi';
import { Device } from '../../types/domain';
import { isApiError } from '../../context/AuthContext';
import DeviceTable from '../../components/devices/DeviceTable';
import EditDeviceDialog from '../../components/devices/EditDeviceDialog';
import Pagination from '../../components/common/Pagination';
import ErrorBanner from '../../components/common/ErrorBanner';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function OperatorEditDevicePage() {
  const navigate = useNavigate();

  const [devices, setDevices] = useState<Device[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Device | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});

  const loadDevices = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await deviceApi.list(targetPage, 'ACTIVATED');
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

  useEffect(() => {
    loadDevices(page);
  }, [page, loadDevices]);

  const handleConfirmEdit = async (serialNumber: string, newIpAddress: string) => {
    setEditSubmitting(true);
    setEditFieldErrors({});
    try {
      await deviceApi.edit({ serialNumber, newIpAddress });
      navigate('/operator/devices', {
        replace: true,
        state: { message: 'Device updated successfully.' },
      });
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message);
        if (err.fieldErrors) setEditFieldErrors(err.fieldErrors);
      } else {
        setError('Unable to update device.');
      }
      setEditSubmitting(false);
    }
  };

  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      {loading && devices.length === 0 ? (
        <LoadingSpinner label="Loading devices…" />
      ) : (
        <>
          <DeviceTable
            devices={devices}
            onEdit={(d) => {
              setEditFieldErrors({});
              setEditTarget(d);
            }}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <EditDeviceDialog
        device={editTarget}
        submitting={editSubmitting}
        fieldErrors={editFieldErrors}
        onConfirm={handleConfirmEdit}
        onCancel={() => {
          setEditTarget(null);
          setEditSubmitting(false);
        }}
      />
    </div>
  );
}
