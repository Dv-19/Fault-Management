import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { deviceApi } from '../../api/deviceApi';
import { Device, PageResponse } from '../../types/domain';
import { isApiError } from '../../context/AuthContext';
import DeviceTable from '../../components/devices/DeviceTable';
import Pagination from '../../components/common/Pagination';
import ErrorBanner from '../../components/common/ErrorBanner';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PAGE_SIZE = 10; // US11: only 10 devices per page

/** Device List tab (US11) — active devices only, view-only, no row actions. */
export default function OperatorDevicesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PageResponse<Device> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as { message?: string })?.message ?? null,
  );

  useEffect(() => {
    if (location.state) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div>
      <div className="page-header">
        <h1>Device list</h1>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      <ErrorBanner message={successMessage} tone="success" onDismiss={() => setSuccessMessage(null)} />

      {loading && !pageData ? (
        <LoadingSpinner label="Loading devices…" />
      ) : (
        <>
          <DeviceTable devices={pageData?.content ?? []} />
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
    </div>
  );
}
