import React from 'react';
import { UserSummary } from '../../types/domain';

interface UserTableProps {
  users: UserSummary[];
  onChangeRole?: (user: UserSummary) => void;
  onDeactivate?: (user: UserSummary) => void;
  /** A1: show Activate button for DEACTIVATED rows */
  onActivate?: (user: UserSummary) => void;
}

export default function UserTable({ users, onChangeRole, onDeactivate, onActivate }: UserTableProps) {
  if (users.length === 0) {
    return <div className="empty-state">No users found.</div>;
  }

  const showActions = onChangeRole || onDeactivate || onActivate;

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
            <tr key={u.id}>
              <td className="mono">{u.username}</td>
              <td>{u.role}</td>
              <td>
                <span
                  className={
                    u.userState === 'ACTIVATED'
                      ? 'state-tag state-tag-active'
                      : 'state-tag state-tag-inactive'
                  }
                >
                  {u.userState}
                </span>
              </td>
              {showActions && (
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {onChangeRole && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-small"
                        disabled={u.userState === 'DEACTIVATED'}
                        onClick={() => onChangeRole(u)}
                      >
                        Change role
                      </button>
                    )}
                    {onDeactivate && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-small"
                        disabled={u.userState === 'DEACTIVATED'}
                        onClick={() => onDeactivate(u)}
                      >
                        Deactivate
                      </button>
                    )}
                    {onActivate && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-small"
                        disabled={u.userState === 'ACTIVATED'}
                        onClick={() => onActivate(u)}
                      >
                        Activate
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
