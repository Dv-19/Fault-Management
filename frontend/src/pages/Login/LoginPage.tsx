import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth, landingPathForRole, isApiError } from '../../context/AuthContext';
import ErrorBanner from '../../components/common/ErrorBanner';
import { BrandMark } from '../../components/layout/icons';
import './login.css';

const VALUE_PROPS = [
  'Live view of alarms across every monitored CPE, switch and line device',
  'Role-based access for Admin, Operator and Manager workflows',
  'Acknowledge, clear and terminate faults with a full audit trail',
];

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navState = location.state as { loggedOut?: boolean; message?: string } | null;
  const [infoMessage, setInfoMessage] = useState<string | null>(
    navState?.message ?? (navState?.loggedOut ? 'User Logged out Successfully' : null),
  );

  useEffect(() => {
    // Clear the one-time navigation state so the banner doesn't reappear
    // if the person navigates back to /login later, and so a page refresh
    // doesn't resubmit it.
    if (navState) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user) {
    const from = (location.state as { from?: Location })?.from?.pathname;
    return <Navigate to={from ?? landingPathForRole(user.role)} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // guard against duplicate submit while pending
    setError(null);
    setSubmitting(true);
    try {
      const loggedInUser = await login({ username, password });
      navigate(landingPathForRole(loggedInUser.role), { replace: true });
    } catch (err) {
      // Backend owns the exact wording ("Wrong username or password",
      // "User is Deactivated") — just display whatever message it sends.
      setError(isApiError(err) ? err.message : 'Unable to log in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <aside className="login-brand-panel">
        <div className="login-brand-mark">
          <BrandMark size={44} />
        </div>
        <h1 className="login-brand-title">Fault Management Dashboard</h1>
        <p className="login-brand-tagline">
          Network operations console for broadband service delivery — collect, view and act on
          device alarms in one place.
        </p>
        <ul className="login-value-list">
          {VALUE_PROPS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </aside>

      <div className="login-form-panel">
        <form className="login-card card" onSubmit={handleSubmit} noValidate>
          <h2 className="login-form-title">Sign in</h2>
          <p className="field-hint" style={{ marginBottom: 'var(--space-4)' }}>
            Use your Admin, Operator, or Manager account.
          </p>
          <ErrorBanner message={infoMessage} tone="success" onDismiss={() => setInfoMessage(null)} />
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
          <div className="login-links">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        </form>
        <p className="login-footnote">Fault Management Dashboard · Internal operations tool</p>
      </div>
    </div>
  );
}
