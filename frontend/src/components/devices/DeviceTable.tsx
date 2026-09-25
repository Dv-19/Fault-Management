import React from 'react';
import { Device } from '../../types/domain';

interface DeviceTableProps {
  devices: Device[];
  onEdit?: (device: Device) => void;
  onDeactivate?: (device: Device) => void;
  /** A1: show Activate button for DEACTIVATED rows */
  onActivate?: (device: Device) => void;
}

export default function DeviceTable({ devices, onEdit, onDeactivate, onActivate }: DeviceTableProps) {
  if (devices.length === 0) {
    return <div className="empty-state">No devices found.</div>;
  }

  const showActions = onEdit || onDeactivate || onActivate;

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
            <tr key={d.id}>
              <td className="mono">{d.serialNumber}</td>
              <td className="mono">{d.ipAddress}</td>
              <td>{d.deviceType}</td>
              <td>
                <span
                  className={
                    d.deviceState === 'ACTIVATED'
                      ? 'state-tag state-tag-active'
                      : 'state-tag state-tag-inactive'
                  }
                >
                  {d.deviceState}
                </span>
              </td>
              {showActions && (
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {onEdit && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-small"
                        disabled={d.deviceState === 'DEACTIVATED'}
                        onClick={() => onEdit(d)}
                      >
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
                        Deactivate
                      </button>
                    )}
                    {onActivate && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-small"
                        disabled={d.deviceState === 'ACTIVATED'}
                        onClick={() => onActivate(d)}
                      >
                        Activate
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
