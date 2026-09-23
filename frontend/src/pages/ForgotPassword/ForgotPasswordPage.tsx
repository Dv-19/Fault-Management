import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { isApiError } from '../../context/AuthContext';
import ErrorBanner from '../../components/common/ErrorBanner';
import '../Login/login.css';

type Step = 'username' | 'reset';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('username');
  const [username, setUsername] = useState('');
  const [question, setQuestion] = useState<{ id: number; text: string } | null>(null);
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await authApi.forgotPasswordQuestion({ username });
      setQuestion({ id: res.securityQuestionId, text: res.question });
      setStep('reset');
    } catch (err) {
      // Backend sends "User does not exist" for unknown usernames.
      setError(isApiError(err) ? err.message : 'Unable to look up that user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question) return;
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await authApi.forgotPasswordReset({
        username,
        securityQuestionId: question.id,
        answer,
        newPassword,
        confirmPassword,
      });
      setSuccess('Password reset. Redirecting to login…');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Unable to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <h1>Forgot password</h1>
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
        <ErrorBanner message={success} tone="success" />

        {step === 'username' && (
          <form onSubmit={handleLookup} noValidate>
            <div className="field">
              <label htmlFor="fp-username">Username</label>
              <input id="fp-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Looking up…' : 'Continue'}
            </button>
          </form>
        )}

        {step === 'reset' && question && (
          <form onSubmit={handleReset} noValidate>
            <div className="field">
              <label>Security question</label>
              <p style={{ margin: 0 }}>{question.text}</p>
            </div>
            <div className="field">
              <label htmlFor="fp-answer">Answer</label>
              <input id="fp-answer" value={answer} onChange={(e) => setAnswer(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="fp-new-password">New password</label>
              <input
                id="fp-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="fp-confirm-password">Confirm new password</label>
              <input
                id="fp-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        )}

        <div className="login-links">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
