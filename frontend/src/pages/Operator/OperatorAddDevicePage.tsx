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
      // US12: "navigate to the list of devices page[US11] automatically."
      navigate('/operator/devices', { replace: true, state: { message: 'Device configured successfully' } });
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message);
        setFieldErrors(err.fieldErrors ?? {});
      } else {
        setError('Unable to add device.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Add device</h1>
      </div>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      <AddDeviceForm submitting={submitting} fieldErrors={fieldErrors} onSubmit={handleSubmit} />
    </div>
  );
}
