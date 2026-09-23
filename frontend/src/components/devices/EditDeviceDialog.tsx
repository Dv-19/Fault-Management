import React, { useEffect, useState } from 'react';
import { Device } from '../../types/domain';
import { validateIpAddress } from '../../api/deviceApi';

interface EditDeviceDialogProps {
  device: Device | null;
  submitting: boolean;
  fieldErrors: Record<string, string>;
  onConfirm: (originalSerialNumber: string, newSerialNumber: string, newIp: string) => void;
  onCancel: () => void;
}

/**
 * US13: serial number and IP are both editable here; device type is shown
 * read-only. Still a pop-up per the SRS, with its own confirm step before
 * the update is sent.
 */
export default function EditDeviceDialog({ device, submitting, fieldErrors, onConfirm, onCancel }: EditDeviceDialogProps) {
  const [serialNumber, setSerialNumber] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [ipError, setIpError] = useState<string | null>(null);
  const [step, setStep] = useState<'edit' | 'confirm'>('edit');

  useEffect(() => {
    setSerialNumber(device?.serialNumber ?? '');
    setIpAddress(device?.ipAddress ?? '');
    setIpError(null);
    setStep('edit');
  }, [device]);

  if (!device) return null;

  const handleContinue = () => {
    const clientIpError = validateIpAddress(ipAddress);
    setIpError(clientIpError);
    if (clientIpError || !serialNumber.trim()) return;
    setStep('confirm');
  };

  return (
    <div className="dialog-overlay" role="presentation" onClick={onCancel}>
      <div className="dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {step === 'edit' ? (
          <>
            <h2>Edit device</h2>
            <div className="field">
              <label htmlFor="edit-serial">Device serial number</label>
              <input
                id="edit-serial"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                required
              />
              {fieldErrors.serialNumber && <span className="field-error">{fieldErrors.serialNumber}</span>}
            </div>
            <div className="field">
              <label htmlFor="edit-ip">Device IP address</label>
              <input
                id="edit-ip"
                value={ipAddress}
                onChange={(e) => {
                  setIpAddress(e.target.value);
                  setIpError(null);
                }}
              />
              {(ipError || fieldErrors.ipAddress) && (
                <span className="field-error">{ipError ?? fieldErrors.ipAddress}</span>
              )}
            </div>
            <div className="field">
              <label>Device type</label>
              <input value={device.deviceType} disabled />
              <span className="field-hint">Device type cannot be changed here.</span>
            </div>
            <div className="dialog-actions">
              <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleContinue} disabled={submitting}>
                Update
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Confirm device update</h2>
            <p className="dialog-description">
              Save {serialNumber} · {ipAddress}?
            </p>
            <div className="dialog-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep('edit')} disabled={submitting}>
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={submitting}
                onClick={() => onConfirm(device.serialNumber, serialNumber, ipAddress)}
              >
                {submitting ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
