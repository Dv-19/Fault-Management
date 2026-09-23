import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import { PageResponse, UserSummary } from '../../types/domain';
import { isApiError } from '../../context/AuthContext';
import UserTable from '../../components/users/UserTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import ErrorBanner from '../../components/common/ErrorBanner';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PAGE_SIZE = 10;

export default function AdminDeleteUserPage() {
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PageResponse<UserSummary> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [target, setTarget] = useState<UserSummary | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleConfirm = async () => {
    if (!target) return;
    setSubmitting(true);
    try {
      await userApi.deactivate(target.userId);
      setTarget(null);
      // US06: "navigate to the user details tab page[US02], the user
      // deletion should be reflected."
      navigate('/admin/users', { replace: true, state: { message: 'User deactivated successfully' } });
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to deactivate user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Delete user</h1>
      </div>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      {loading && !pageData ? (
        <LoadingSpinner label="Loading users…" />
      ) : (
        <>
          <UserTable users={pageData?.content ?? []} onDeactivate={setTarget} />
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
        title={`Delete ${target?.username ?? ''}?`}
        description="The user record is kept, but their state becomes Deactivated and they can no longer log in."
        confirmLabel="Delete"
        destructive
        busy={submitting}
        onConfirm={handleConfirm}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
