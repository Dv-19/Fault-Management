import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import { PageResponse, Role, UserSummary } from '../../types/domain';
import { isApiError } from '../../context/AuthContext';
import UserTable from '../../components/users/UserTable';
import ChangeRoleDialog from '../../components/users/ChangeRoleDialog';
import Pagination from '../../components/common/Pagination';
import ErrorBanner from '../../components/common/ErrorBanner';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PAGE_SIZE = 10; // US03: only 10 users per page

/** User Details tab (US03) — list only, plus the role-change action (US05). */
export default function AdminUsersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PageResponse<UserSummary> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as { message?: string })?.message ?? null,
  );

  useEffect(() => {
    // Clear the one-time navigation-state message so it doesn't reappear
    // on refresh or when navigating back to this tab later.
    if (location.state) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [roleTarget, setRoleTarget] = useState<UserSummary | null>(null);
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  const loadUsers = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.list(targetPage, PAGE_SIZE);
      setPageData(data);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(page);
  }, [page, loadUsers]);

  const handleConfirmRoleChange = async (username: string, role: Role) => {
    setRoleSubmitting(true);
    try {
      const res = await userApi.changeRole(username, role);
      setRoleTarget(null);
      setSuccessMessage(res.message || 'User updated successfully');
      await loadUsers(page);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to update role.');
    } finally {
      setRoleSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>User details</h1>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      <ErrorBanner message={successMessage} tone="success" onDismiss={() => setSuccessMessage(null)} />

      {loading && !pageData ? (
        <LoadingSpinner label="Loading users…" />
      ) : (
        <>
          <UserTable users={pageData?.content ?? []} onChangeRole={setRoleTarget} />
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

      <ChangeRoleDialog
        user={roleTarget}
        submitting={roleSubmitting}
        onConfirm={handleConfirmRoleChange}
        onCancel={() => setRoleTarget(null)}
      />
    </div>
  );
}
