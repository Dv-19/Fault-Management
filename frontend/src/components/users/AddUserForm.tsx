/**
 * Add User form (US04).
 * POST /api/users  body: { username, password, role, secretQuestion, secretAnswer }
 *
 * Integration doc §5.2:
 *  - Password set to username value by default (user changes on first login).
 *  - secretQuestion is the enum string (FIRST_PET, BIRTH_CITY, etc.).
 *  - Password strength meter is client-side visual only; backend enforces min 4 chars.
 */
import React, { useState } from 'react';
import { CreateUserRequest } from '../../api/userApi';
import { Role } from '../../types/domain';
import { SECURITY_QUESTIONS } from '../../config/securityQuestions';
import PasswordStrengthBar from '../common/PasswordStrengthBar';

interface AddUserFormProps {
  submitting: boolean;
  fieldErrors: Record<string, string>;
  onSubmit: (payload: CreateUserRequest) => void;
}

const ROLES: Role[] = ['ADMIN', 'OPERATOR', 'MANAGER'];

export default function AddUserForm({ submitting, fieldErrors, onSubmit }: AddUserFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('OPERATOR');
  const [secretQuestion, setSecretQuestion] = useState(SECURITY_QUESTIONS[0].value);
  const [secretAnswer, setSecretAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ username, password, role, secretQuestion, secretAnswer });
  };

  return (
    <form className="card" style={{ maxWidth: 480 }} onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="new-username">Username</label>
        <input
          id="new-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
          required
        />
        {fieldErrors.username && (
          <span className="field-error">{fieldErrors.username}</span>
        )}
      </div>

      <div className="field">
        <label htmlFor="new-password">Password</label>
        <input
          id="new-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <PasswordStrengthBar password={password} />
        <span className="field-hint">Minimum 4 characters.</span>
        {fieldErrors.password && (
          <span className="field-error">{fieldErrors.password}</span>
        )}
      </div>

      <div className="field">
        <label htmlFor="new-role">Role</label>
        <select id="new-role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {fieldErrors.role && <span className="field-error">{fieldErrors.role}</span>}
      </div>

      <div className="field">
        <label htmlFor="new-secret-question">Secret question</label>
        <select
          id="new-secret-question"
          value={secretQuestion}
          onChange={(e) => setSecretQuestion(e.target.value as typeof secretQuestion)}
        >
          {SECURITY_QUESTIONS.map((q) => (
            <option key={q.value} value={q.value}>{q.label}</option>
          ))}
        </select>
        {fieldErrors.secretQuestion && (
          <span className="field-error">{fieldErrors.secretQuestion}</span>
        )}
      </div>

      <div className="field">
        <label htmlFor="new-secret-answer">Secret answer</label>
        <input
          id="new-secret-answer"
          value={secretAnswer}
          onChange={(e) => setSecretAnswer(e.target.value)}
          autoComplete="off"
          required
        />
        <span className="field-hint">Used for Forgot Password.</span>
        {fieldErrors.secretAnswer && (
          <span className="field-error">{fieldErrors.secretAnswer}</span>
        )}
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add user'}
      </button>
    </form>
  );
}
