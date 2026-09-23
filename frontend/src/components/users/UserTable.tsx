import React from 'react';
import { UserSummary } from '../../types/domain';

interface UserTableProps {
  users: UserSummary[];
  /** Omit to hide the "Change role" action entirely (e.g. Delete User tab). */
  onChangeRole?: (user: UserSummary) => void;
  /** Omit to hide the "Delete" action entirely (e.g. User Details tab). */
  onDeactivate?: (user: UserSummary) => void;
}

export default function UserTable({ users, onChangeRole, onDeactivate }: UserTableProps) {
  if (users.length === 0) {
    return <div className="empty-state">No users found.</div>;
  }

  const showActions = onChangeRole || onDeactivate;

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>State</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.userId}>
              <td className="mono">{u.username}</td>
              <td>{u.role}</td>
              <td>
                <span className={u.userState === 'ACTIVATED' ? 'state-tag state-tag-active' : 'state-tag state-tag-inactive'}>
                  {u.userState}
                </span>
              </td>
              {showActions && (
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {onChangeRole && (
                      <button type="button" className="btn btn-ghost btn-small" onClick={() => onChangeRole(u)}>
                        Edit role
                      </button>
                    )}
                    {onDeactivate && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-small"
                        disabled={u.userState === 'DEACTIVATED'}
                        onClick={() => onDeactivate(u)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
