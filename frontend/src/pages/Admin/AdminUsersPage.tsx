/**
 * Admin — User Details (US03) + Role change (US05) + Activate/Deactivate (US06/A1) + Search (A2).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import { UserSummary, Role } from '../../types/domain';
import { isApiError } from '../../context/AuthContext';
import UserTable from '../../components/users/UserTable';
import ChangeRoleDialog from '../../components/users/ChangeRoleDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import ErrorBanner from '../../components/common/ErrorBanner';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DEBOUNCE_MS = 300;
type ToggleAction = { user: UserSummary; action: 'activate' | 'deactivate' };

export default function AdminUsersPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [users, setUsers]                   = useState<UserSummary[]>([]);
  const [page, setPage]                     = useState(0);
  const [totalPages, setTotalPages]         = useState(0);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as { message?: string })?.message ?? null,
  );

  const [searchInput, setSearchInput]   = useState('');
  const [searchQuery, setSearchQuery]   = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [roleTarget, setRoleTarget]         = useState<UserSummary | null>(null);
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [toggleTarget, setToggleTarget]     = useState<ToggleAction | null>(null);
  const [toggleSubmitting, setToggleSubmitting] = useState(false);

  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      setSearchQuery(val.trim());
    }, DEBOUNCE_MS);
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

  const handleConfirmRoleChange = async (username: string, newRole: Role) => {
    setRoleSubmitting(true);
    try {
      const res = await userApi.changeRole({ username, newRole });
      setRoleTarget(null);
      setSuccessMessage(res.data.message || 'Role updated.');
      await loadUsers(page, searchQuery);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to update role.');
    } finally {
      setRoleSubmitting(false);
    }
  };

  const handleConfirmToggle = async () => {
    if (!toggleTarget) return;
    setToggleSubmitting(true);
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
      setToggleSubmitting(false);
    }
  };

  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      <ErrorBanner message={successMessage} tone="success" onDismiss={() => setSuccessMessage(null)} />

      <div className="toolbar card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="field" style={{ marginBottom: 0, flex: 1, maxWidth: 360 }}>
          <label htmlFor="user-search">Search username</label>
          <input
            id="user-search"
            placeholder="e.g. operator"
            value={searchInput}
            maxLength={100}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
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
            onChangeRole={setRoleTarget}
            onDeactivate={(u) => setToggleTarget({ user: u, action: 'deactivate' })}
            onActivate={(u) => setToggleTarget({ user: u, action: 'activate' })}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ChangeRoleDialog user={roleTarget} submitting={roleSubmitting}
        onConfirm={handleConfirmRoleChange} onCancel={() => setRoleTarget(null)} />

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
        busy={toggleSubmitting}
        onConfirm={handleConfirmToggle}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  );
}
