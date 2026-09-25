/**
 * Forgot Password — 3-step flow matching the backend exactly:
 *
 * Step 1 (/question): submit username → receive SecretQuestion enum string
 * Step 2 (/verify):   submit username + answer → sets session flag on server
 * Step 3 (/reset):    submit username + new password → resets password
 *
 * All three calls must share the same browser session (credentials: true).
 * The verify session flag expires after 5 minutes — on that error, send
 * the user back to step 2.
 *
 * Integration doc §4.2
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { isApiError } from '../../context/AuthContext';
import { questionLabel } from '../../config/securityQuestions';
import { SecretQuestion } from '../../types/domain';
import ErrorBanner from '../../components/common/ErrorBanner';
import PasswordStrengthBar from '../../components/common/PasswordStrengthBar';
import '../Login/login.css';

type Step = 'username' | 'verify' | 'reset';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('username');
  const [username, setUsername] = useState('');
  const [question, setQuestion] = useState<SecretQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Step 1 — look up the secret question ──────────────────────────────────
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await authApi.forgotPasswordQuestion({ username });
      setQuestion(res.data.data); // SecretQuestion enum string
      setStep('verify');
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to look up that user.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 2 — verify the answer ────────────────────────────────────────────
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await authApi.forgotPasswordVerify({ username, answer });
      setStep('reset');
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to verify answer.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 3 — reset the password ───────────────────────────────────────────
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.forgotPasswordReset({ username, newPassword, confirmPassword });
      navigate('/login', {
        replace: true,
        state: { message: 'Password reset successfully. Please log in.' },
      });
    } catch (err) {
      if (isApiError(err)) {
        // "verification has expired" — send back to verify step
        if (err.message.includes('expired')) {
          setStep('verify');
          setAnswer('');
        }
        setError(err.message);
      } else {
        setError('Unable to reset password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <aside className="login-brand-panel">
        <svg className="login-logo" viewBox="0 0 48 48" aria-hidden="true">
          <rect width="48" height="48" rx="12" fill="var(--color-accent)" />
          <path d="M13 34V18a2 2 0 0 1 2-2h16"
            stroke="#fff" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M13 25h10"
            stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="33" cy="16" r="3.5" fill="#fff" />
        </svg>
        <div className="login-brand-text">
          <span className="login-brand-name">Fault Management</span>
          <span className="login-brand-sub">Network Operations Console</span>
        </div>
      </aside>

      <div className="login-form-panel">
        <div className="login-card">
          <h2 className="login-form-title">Forgot password</h2>
          <p className="login-form-sub">
            Step {step === 'username' ? 1 : step === 'verify' ? 2 : 3} of 3
          </p>

          <ErrorBanner message={error} onDismiss={() => setError(null)} />

          {/* ── Step 1 ── */}
          {step === 'username' && (
            <form onSubmit={handleStep1} noValidate>
              <div className="field">
                <label htmlFor="fp-username">Username</label>
                <input
                  id="fp-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: '100%' }}
              >
                {submitting ? 'Looking up…' : 'Continue'}
              </button>
            </form>
          )}

          {/* ── Step 2 ── */}
          {step === 'verify' && question && (
            <form onSubmit={handleStep2} noValidate>
              <div className="field">
                <label>Security question</label>
                <p style={{ margin: 0, fontWeight: 500 }}>{questionLabel(question)}</p>
              </div>
              <div className="field">
                <label htmlFor="fp-answer">Answer</label>
                <input
                  id="fp-answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  autoComplete="off"
                  required
                />
                <span className="field-hint">Answer is case-insensitive.</span>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: '100%' }}
              >
                {submitting ? 'Verifying…' : 'Verify answer'}
              </button>
            </form>
          )}

          {/* ── Step 3 ── */}
          {step === 'reset' && (
            <form onSubmit={handleStep3} noValidate>
              <div className="field">
                <label htmlFor="fp-new-password">New password</label>
                <input
                  id="fp-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <PasswordStrengthBar password={newPassword} />
              </div>
              <div className="field">
                <label htmlFor="fp-confirm-password">Confirm new password</label>
                <input
                  id="fp-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: '100%' }}
              >
                {submitting ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
          )}

          <div className="login-footer-link" style={{ marginTop: 'var(--space-4)' }}>
            <Link to="/login">Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
