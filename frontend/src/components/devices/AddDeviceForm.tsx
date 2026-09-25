/**
 * Add Device form (US12).
 * POST /api/devices  body: { serialNumber, ipAddress, deviceType }
 * deviceType must be one of the DeviceType enum values: HUB | SWITCH | ROUTER
 */
import React, { useState } from 'react';
import { CreateDeviceRequest, validateIpAddress, DEVICE_TYPES } from '../../api/deviceApi';

interface AddDeviceFormProps {
  submitting: boolean;
  fieldErrors: Record<string, string>;
  onSubmit: (payload: CreateDeviceRequest) => void;
}

export default function AddDeviceForm({ submitting, fieldErrors, onSubmit }: AddDeviceFormProps) {
  const [serialNumber, setSerialNumber] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [deviceType, setDeviceType] = useState(DEVICE_TYPES[0]);
  const [ipError, setIpError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientIpError = validateIpAddress(ipAddress);
    setIpError(clientIpError);
    if (clientIpError) return;
    onSubmit({ serialNumber: serialNumber.trim(), ipAddress: ipAddress.trim(), deviceType });
  };

  return (
    <form className="card" style={{ maxWidth: 480 }} onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="device-serial">Serial number</label>
        <input
          id="device-serial"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          placeholder="e.g. SN-2001"
          required
        />
        {fieldErrors.serialNumber && (
          <span className="field-error">{fieldErrors.serialNumber}</span>
        )}
      </div>

      <div className="field">
        <label htmlFor="device-ip">IP address</label>
        <input
          id="device-ip"
          value={ipAddress}
          onChange={(e) => {
            setIpAddress(e.target.value);
            setIpError(null);
          }}
          placeholder="e.g. 192.168.1.50"
          required
        />
        {(ipError || fieldErrors.ipAddress) && (
          <span className="field-error">{ipError ?? fieldErrors.ipAddress}</span>
        )}
      </div>

      <div className="field">
        <label htmlFor="device-type">Device type</label>
        <select
          id="device-type"
          value={deviceType}
          onChange={(e) => setDeviceType(e.target.value)}
        >
          {DEVICE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {fieldErrors.deviceType && (
          <span className="field-error">{fieldErrors.deviceType}</span>
        )}
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add device'}
      </button>
    </form>
  );
}
