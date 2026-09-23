import React, { useState } from 'react';
import { CreateDeviceRequest, validateIpAddress } from '../../api/deviceApi';

interface AddDeviceFormProps {
  submitting: boolean;
  fieldErrors: Record<string, string>;
  onSubmit: (payload: CreateDeviceRequest) => void;
}

/**
 * Plain in-page form (US12), not a dialog — "Add device tab should get
 * input from the user". The controlled list of device types isn't
 * specified by the backend yet, so it's free text for now.
 *
 * "Utilization Metrics should be enabled only if utilization in reports is
 * checked" is genuinely ambiguous in the SRS (no other section defines what
 * utilization reporting means for a fault dashboard). Implemented as a
 * best-effort interpretation: a checkbox that unlocks an optional metrics
 * field — confirm the real intent with the product owner before relying on
 * this going to the backend as-is.
 */
export default function AddDeviceForm({ submitting, fieldErrors, onSubmit }: AddDeviceFormProps) {
  const [serialNumber, setSerialNumber] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [ipError, setIpError] = useState<string | null>(null);
  const [includeInUtilizationReports, setIncludeInUtilizationReports] = useState(false);
  const [utilizationMetrics, setUtilizationMetrics] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientIpError = validateIpAddress(ipAddress);
    setIpError(clientIpError);
    if (clientIpError) return;
    onSubmit({ serialNumber, ipAddress, deviceType });
  };

  return (
    <form className="card" style={{ maxWidth: 480 }} onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="device-serial">Device serial number</label>
        <input id="device-serial" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} required />
        {fieldErrors.serialNumber && <span className="field-error">{fieldErrors.serialNumber}</span>}
      </div>
      <div className="field">
        <label htmlFor="device-ip">Device IP address</label>
        <input
          id="device-ip"
          value={ipAddress}
          onChange={(e) => {
            setIpAddress(e.target.value);
            setIpError(null);
          }}
          required
        />
        {(ipError || fieldErrors.ipAddress) && <span className="field-error">{ipError ?? fieldErrors.ipAddress}</span>}
      </div>
      <div className="field">
        <label htmlFor="device-type">Device type</label>
        <input id="device-type" value={deviceType} onChange={(e) => setDeviceType(e.target.value)} required />
        {fieldErrors.deviceType && <span className="field-error">{fieldErrors.deviceType}</span>}
      </div>
      <div className="field">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={includeInUtilizationReports}
            onChange={(e) => {
              setIncludeInUtilizationReports(e.target.checked);
              if (!e.target.checked) setUtilizationMetrics('');
            }}
          />
          Include in utilization reports
        </label>
      </div>
      <div className="field">
        <label htmlFor="utilization-metrics">Utilization metrics</label>
        <input
          id="utilization-metrics"
          value={utilizationMetrics}
          onChange={(e) => setUtilizationMetrics(e.target.value)}
          disabled={!includeInUtilizationReports}
          placeholder="Enabled once utilization reporting is checked"
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add device'}
      </button>
    </form>
  );
}
