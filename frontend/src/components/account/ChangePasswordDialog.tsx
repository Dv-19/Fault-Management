import React, { useState } from 'react';
import { authApi } from '../../api/authApi';
import { isApiError } from '../../context/AuthContext';
import ErrorBanner from '../common/ErrorBanner';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful change — caller handles logout + redirect. */
  onSuccess: (message: string) => void;
}

/**
 * US09: "When clicked on change password button, then a pop [up] should
 * display, asking the details of Current Password, New Password and
 * Retype New Password with a captcha." A real captcha provider isn't named
 * in the SRS, so `captchaResponse` is a plain text stand-in — swap the
 * input for a real widget later without touching the request shape.
 */
export default function ChangePasswordDialog({ open, onClose, onSuccess }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaResponse, setCaptchaResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const clearSensitiveFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setCaptchaResponse('');
  };

  const handleClose = () => {
    clearSensitiveFields();
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Only current password is checked server-side after submit; the rest
    // is validated here first, per the SRS's front-end/back-end split.
    if (newPassword !== confirmPassword) {
      setError('Password provided are not same');
      return;
    }
    if (!captchaResponse.trim()) {
      setError('Captcha is required');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword, confirmPassword, captchaResponse });
      clearSensitiveFields();
      onSuccess('Password changed successfully, Please login again');
    } catch (err) {
      // Backend owns the exact wording for "Current password is not valid",
      // "Password Requirement is not matched", etc.
      setError(isApiError(err) ? err.message : 'Unable to change password. Please try again.');
      clearSensitiveFields();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dialog-overlay" role="presentation" onClick={handleClose}>
      <div className="dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
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
              required
            />
            <span className="field-hint">
              Upper &amp; lower case, a number, and one of @#$%&amp;*!^ — 4-6 chars is Weak, 6-8 is
              Medium, 8+ is Strong.
            </span>
          </div>
          <div className="field">
            <label htmlFor="cp-confirm">Retype new password</label>
            <input
              id="cp-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="cp-captcha">Captcha</label>
            <input
              id="cp-captcha"
              value={captchaResponse}
              onChange={(e) => setCaptchaResponse(e.target.value)}
              placeholder="Placeholder until a captcha provider is wired in"
              required
            />
          </div>
          <div className="dialog-actions">
            <button type="button" className="btn btn-ghost" onClick={handleClose} disabled={submitting}>
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
