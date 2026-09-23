import React from 'react';
import { Device } from '../../types/domain';

interface DeviceTableProps {
  devices: Device[];
  /** Omit to hide the "Edit" action (e.g. Device List tab is view-only). */
  onEdit?: (device: Device) => void;
  /** Omit to hide the "Delete" action (e.g. Device List / Edit Device tabs). */
  onDeactivate?: (device: Device) => void;
}

export default function DeviceTable({ devices, onEdit, onDeactivate }: DeviceTableProps) {
  if (devices.length === 0) {
    return <div className="empty-state">No devices found.</div>;
  }

  const showActions = onEdit || onDeactivate;

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Serial number</th>
            <th>IP address</th>
            <th>Type</th>
            <th>State</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.deviceId}>
              <td className="mono">{d.serialNumber}</td>
              <td className="mono">{d.ipAddress}</td>
              <td>{d.deviceType}</td>
              <td>
                <span className={d.deviceState === 'ACTIVATED' ? 'state-tag state-tag-active' : 'state-tag state-tag-inactive'}>
                  {d.deviceState}
                </span>
              </td>
              {showActions && (
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {onEdit && (
                      <button type="button" className="btn btn-ghost btn-small" onClick={() => onEdit(d)}>
                        Edit
                      </button>
                    )}
                    {onDeactivate && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-small"
                        disabled={d.deviceState === 'DEACTIVATED'}
                        onClick={() => onDeactivate(d)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
