/**
 * Admin — Add User (US04).
 * POST /api/users
 * On success redirects to /admin/users with a success banner.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi, CreateUserRequest } from '../../api/userApi';
import { isApiError } from '../../context/AuthContext';
import AddUserForm from '../../components/users/AddUserForm';
import ErrorBanner from '../../components/common/ErrorBanner';

export default function AdminAddUserPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (payload: CreateUserRequest) => {
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await userApi.create(payload);
      navigate('/admin/users', {
        replace: true,
        state: { message: 'User added successfully.' },
      });
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message);
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      } else {
        setError('Unable to add user.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      <AddUserForm submitting={submitting} fieldErrors={fieldErrors} onSubmit={handleSubmit} />
    </div>
  );
}
