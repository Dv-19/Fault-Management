/**
 * Login page (US01) — minimal, professional.
 * POST /api/auth/login
 */
import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, landingPathForRole, isApiError } from '../../context/AuthContext';
import ErrorBanner from '../../components/common/ErrorBanner';
import './login.css';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navState = location.state as { loggedOut?: boolean; message?: string } | null;
  const [infoMessage, setInfoMessage] = useState<string | null>(
    navState?.message ?? (navState?.loggedOut ? 'You have been logged out.' : null),
  );

  useEffect(() => {
    if (navState) navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
    return <Navigate to={from ?? landingPathForRole(user.role)} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const loggedInUser = await login({ username, password });
      navigate(landingPathForRole(loggedInUser.role), { replace: true });
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to log in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">

      {/* ── Left panel ── */}
      <aside className="login-brand-panel">
        {/* SVG logo mark */}
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

      {/* ── Right panel ── */}
      <div className="login-form-panel">
        <form className="login-card" onSubmit={handleSubmit} noValidate>

          <h2 className="login-form-title">Welcome back</h2>
          <p className="login-form-sub">Sign in to your account to continue</p>

          <ErrorBanner
            message={infoMessage}
            tone="success"
            onDismiss={() => setInfoMessage(null)}
          />
          <ErrorBanner message={error} onDismiss={() => setError(null)} />

          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={submitting}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="login-footer-link">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

        </form>
      </div>
    </div>
  );
}
