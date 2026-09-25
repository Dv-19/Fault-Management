/**
 * Edit Device dialog (US13).
 * PUT /api/devices  body: { serialNumber, newIpAddress }
 *
 * The backend EditDeviceRequestDto accepts:
 *   - serialNumber: lookup key (identifies which device to edit, cannot be changed)
 *   - newIpAddress: the new IP to set
 *
 * Note: the SRS mentions serial number as editable, but the backend only
 * supports IP editing. Serial and device type are shown read-only.
 */
import React, { useEffect, useState } from 'react';
import { Device } from '../../types/domain';
import { validateIpAddress } from '../../api/deviceApi';

interface EditDeviceDialogProps {
  device: Device | null;
  submitting: boolean;
  fieldErrors: Record<string, string>;
  onConfirm: (serialNumber: string, newIpAddress: string) => void;
  onCancel: () => void;
}

export default function EditDeviceDialog({
  device,
  submitting,
  fieldErrors,
  onConfirm,
  onCancel,
}: EditDeviceDialogProps) {
  const [newIpAddress, setNewIpAddress] = useState('');
  const [ipError, setIpError] = useState<string | null>(null);
  const [step, setStep] = useState<'edit' | 'confirm'>('edit');

  useEffect(() => {
    if (device) {
      setNewIpAddress(device.ipAddress);
      setIpError(null);
      setStep('edit');
    }
  }, [device]);

  if (!device) return null;

  const handleContinue = () => {
    const err = validateIpAddress(newIpAddress);
    setIpError(err);
    if (err) return;
    setStep('confirm');
  };

  return (
    <div className="dialog-overlay" role="presentation" onClick={onCancel}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'edit' ? (
          <>
            <h2>Edit device</h2>

            <div className="field">
              <label>Serial number</label>
              <input value={device.serialNumber} disabled />
              <span className="field-hint">Serial number cannot be changed.</span>
            </div>

            <div className="field">
              <label htmlFor="edit-ip">IP address</label>
              <input
                id="edit-ip"
                value={newIpAddress}
                onChange={(e) => {
                  setNewIpAddress(e.target.value);
                  setIpError(null);
                }}
                required
              />
              {(ipError || fieldErrors.newIpAddress) && (
                <span className="field-error">{ipError ?? fieldErrors.newIpAddress}</span>
              )}
            </div>

            <div className="field">
              <label>Device type</label>
              <input value={device.deviceType} disabled />
              <span className="field-hint">Device type cannot be changed.</span>
            </div>

            <div className="dialog-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleContinue}
                disabled={submitting}
              >
                Update
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Confirm device update</h2>
            <p className="dialog-description">
              Update IP address for <strong>{device.serialNumber}</strong> to{' '}
              <strong>{newIpAddress}</strong>?
            </p>
            <div className="dialog-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setStep('edit')}
                disabled={submitting}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={submitting}
                onClick={() => onConfirm(device.serialNumber, newIpAddress)}
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
