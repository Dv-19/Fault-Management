/**
 * Admin — Delete (Deactivate) / Activate User (US06 + A1) + Search (A2).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { userApi } from '../../api/userApi';
import { UserSummary } from '../../types/domain';
import { isApiError } from '../../context/AuthContext';
import UserTable from '../../components/users/UserTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import ErrorBanner from '../../components/common/ErrorBanner';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DEBOUNCE_MS = 300;
type ToggleAction = { user: UserSummary; action: 'activate' | 'deactivate' };

export default function AdminDeleteUserPage() {
  const [users, setUsers]                   = useState<UserSummary[]>([]);
  const [page, setPage]                     = useState(0);
  const [totalPages, setTotalPages]         = useState(0);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [toggleTarget, setToggleTarget]     = useState<ToggleAction | null>(null);
  const [submitting, setSubmitting]         = useState(false);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(0); setSearchQuery(val.trim()); }, DEBOUNCE_MS);
  };

  const loadUsers = useCallback(async (targetPage: number, query: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await userApi.list(targetPage, query || undefined);
      const paged = res.data.data;
      setUsers(paged.content);
      setTotalPages(paged.totalPages);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to load users.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(page, searchQuery); }, [page, searchQuery, loadUsers]);

  const handleConfirm = async () => {
    if (!toggleTarget) return;
    setSubmitting(true);
    try {
      const { user, action } = toggleTarget;
      const res = action === 'activate'
        ? await userApi.activate({ username: user.username })
        : await userApi.deactivate({ username: user.username });
      setToggleTarget(null);
      setSuccessMessage(res.data.message || `User ${action}d.`);
      await loadUsers(page, searchQuery);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to update user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      <ErrorBanner message={successMessage} tone="success" onDismiss={() => setSuccessMessage(null)} />

      <div className="toolbar card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="field" style={{ marginBottom: 0, flex: 1, maxWidth: 360 }}>
          <label htmlFor="del-user-search">Search username</label>
          <input id="del-user-search" placeholder="e.g. operator" value={searchInput}
            maxLength={100} onChange={(e) => handleSearchChange(e.target.value)} />
        </div>
        {searchQuery && (
          <button type="button" className="btn btn-ghost" style={{ alignSelf: 'flex-end' }}
            onClick={() => { setSearchInput(''); setPage(0); setSearchQuery(''); }}>
            Clear
          </button>
        )}
      </div>

      {loading && users.length === 0 ? <LoadingSpinner label="Loading users…" /> : (
        <>
          <UserTable
            users={users}
            onDeactivate={(u) => setToggleTarget({ user: u, action: 'deactivate' })}
            onActivate={(u) => setToggleTarget({ user: u, action: 'activate' })}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.action === 'activate'
          ? `Activate ${toggleTarget?.user.username ?? ''}?`
          : `Deactivate ${toggleTarget?.user.username ?? ''}?`}
        description={toggleTarget?.action === 'activate'
          ? 'The user will be able to log in again.'
          : 'The user record is kept but they can no longer log in.'}
        confirmLabel={toggleTarget?.action === 'activate' ? 'Activate' : 'Deactivate'}
        destructive={toggleTarget?.action === 'deactivate'}
        busy={submitting}
        onConfirm={handleConfirm}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  );
}
