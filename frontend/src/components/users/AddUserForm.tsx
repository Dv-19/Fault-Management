import React, { useState } from 'react';
import { CreateUserRequest } from '../../api/userApi';
import { Role } from '../../types/domain';
import { SECURITY_QUESTIONS } from '../../config/securityQuestions';

interface AddUserFormProps {
  submitting: boolean;
  fieldErrors: Record<string, string>;
  onSubmit: (payload: CreateUserRequest) => void;
}

const ROLES: Role[] = ['ADMIN', 'OPERATOR', 'MANAGER'];

/**
 * Plain in-page form (US04), not a dialog — "Add user tab should contain a
 * form". Per the SRS, the admin never types a password: "Password should be
 * same as the username during registration. Once the user login for the
 * first time, they have to change the existing password." So there's no
 * password field here at all — the payload's password/confirmPassword are
 * set to the username automatically when this form submits.
 */
export default function AddUserForm({ submitting, fieldErrors, onSubmit }: AddUserFormProps) {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<Role>('OPERATOR');
  const [securityQuestionId, setSecurityQuestionId] = useState(SECURITY_QUESTIONS[0].id);
  const [securityAnswer, setSecurityAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      username,
      password: username,
      confirmPassword: username,
      role,
      securityQuestionId,
      securityAnswer,
    });
  };

  return (
    <form className="card" style={{ maxWidth: 480 }} onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="new-username">Username</label>
        <input id="new-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
        <span className="field-hint">
          The initial password is set to the username. The user must change it on first login.
        </span>
      </div>
      <div className="field">
        <label htmlFor="role">Role</label>
        <select id="role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="security-question">Secret question</label>
        <select
          id="security-question"
          value={securityQuestionId}
          onChange={(e) => setSecurityQuestionId(Number(e.target.value))}
        >
          {SECURITY_QUESTIONS.map((q) => (
            <option key={q.id} value={q.id}>
              {q.text}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="security-answer">Answer</label>
        <input
          id="security-answer"
          value={securityAnswer}
          onChange={(e) => setSecurityAnswer(e.target.value)}
          required
        />
        <span className="field-hint">Used for Forgot Password.</span>
      </div>
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add user'}
      </button>
    </form>
  );
}
