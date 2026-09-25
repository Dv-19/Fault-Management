/**
 * Change Password dialog (US09).
 * PUT /api/users/change-password
 *
 * Integration doc §4.1:
 *  - Wrong current password → 401. Must NOT trigger global "session expired"
 *    logout — handled locally here by reading response.status directly.
 *  - On success the backend keeps the session alive, but the frontend
 *    should logout and redirect to /login (caller handles this via onSuccess).
 */
import React, { useState } from 'react';
import { authApi } from '../../api/authApi';
import ErrorBanner from '../common/ErrorBanner';
import PasswordStrengthBar from '../common/PasswordStrengthBar';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called after a successful change — caller handles logout + redirect. */
  onSuccess: (message: string) => void;
}

export default function ChangePasswordDialog({ open, onClose, onSuccess }: Props) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const clearFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClose = () => {
    clearFields();
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // validateStatus: () => true means axios never rejects — we check
      // response.status ourselves so 401 (wrong current password) does NOT
      // fire the global auth:unauthorized event and log the user out.
      const res = await authApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.status >= 200 && res.status < 300) {
        clearFields();
        onSuccess(res.data.message || 'Password changed successfully. Please log in again.');
      } else {
        // 400 validation, 401 wrong password, etc. — show the server message
        const errData = res.data as unknown as { message?: string };
        setError(errData?.message ?? 'Unable to change password. Please try again.');
        clearFields();
      }
    } catch {
      setError('Unable to reach the server. Please try again.');
      clearFields();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dialog-overlay" role="presentation" onClick={handleClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Change password</h2>
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="cp-current">Current password</label>
            <input
              id="cp-current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="cp-new">New password</label>
            <input
              id="cp-new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <PasswordStrengthBar password={newPassword} />
          </div>
          <div className="field">
            <label htmlFor="cp-confirm">Confirm new password</label>
            <input
              id="cp-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="dialog-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Changing…' : 'Change password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
