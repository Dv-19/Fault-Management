import React, { useEffect, useState } from 'react';
import { Role, UserSummary } from '../../types/domain';

interface ChangeRoleDialogProps {
  user: UserSummary | null;
  submitting: boolean;
  onConfirm: (username: string, newRole: Role) => void;
  onCancel: () => void;
}

const ALL_ROLES: Role[] = ['ADMIN', 'OPERATOR', 'MANAGER'];

export default function ChangeRoleDialog({
  user,
  submitting,
  onConfirm,
  onCancel,
}: ChangeRoleDialogProps) {
  const otherRoles = user ? ALL_ROLES.filter((r) => r !== user.role) : [];
  const [role, setRole] = useState<Role | undefined>(otherRoles[0]);
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  useEffect(() => {
    if (user) {
      const roles = ALL_ROLES.filter((r) => r !== user.role);
      setRole(roles[0]);
      setStep('select');
    }
  }, [user]);

  if (!user || !role) return null;

  const handleCancelAll = () => {
    setStep('select');
    onCancel();
  };

  return (
    <div className="dialog-overlay" role="presentation" onClick={handleCancelAll}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'select' ? (
          <>
            <h2>Change role for {user.username}</h2>
            <div className="field">
              <label htmlFor="change-role-select">New role</label>
              <select
                id="change-role-select"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                {otherRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="dialog-actions">
              <button type="button" className="btn btn-ghost" onClick={handleCancelAll}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep('confirm')}
              >
                Change
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Confirm role change</h2>
            <p className="dialog-description">
              Change {user.username}'s role from <strong>{user.role}</strong> to{' '}
              <strong>{role}</strong>?
            </p>
            <div className="dialog-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCancelAll}
                disabled={submitting}
              >
                No
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={submitting}
                onClick={() => onConfirm(user.username, role)}
              >
                {submitting ? 'Saving…' : 'Yes, change it'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
