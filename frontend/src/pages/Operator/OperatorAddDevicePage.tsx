/**
 * Operator — Add Device (US12).
 * POST /api/devices
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deviceApi, CreateDeviceRequest } from '../../api/deviceApi';
import { isApiError } from '../../context/AuthContext';
import AddDeviceForm from '../../components/devices/AddDeviceForm';
import ErrorBanner from '../../components/common/ErrorBanner';

export default function OperatorAddDevicePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (payload: CreateDeviceRequest) => {
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await deviceApi.add(payload);
      navigate('/operator/devices', {
        replace: true,
        state: { message: 'Device added successfully.' },
      });
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message);
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      } else {
        setError('Unable to add device.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      <AddDeviceForm submitting={submitting} fieldErrors={fieldErrors} onSubmit={handleSubmit} />
    </div>
  );
}
