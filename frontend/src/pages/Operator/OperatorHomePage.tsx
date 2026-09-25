/**
 * Operator Home Page (FE US10).
 * SRS: After login, OPERATOR lands here. Shows welcome message and
 * shortcuts to device management tabs.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OPERATOR_FEATURES = [
  {
    title: 'Device List',
    description: 'View all active monitored devices and their details.',
    path: '/operator/devices',
    icon: '🖥️',
  },
  {
    title: 'Add Device',
    description: 'Register a new device for fault monitoring.',
    path: '/operator/add-device',
    icon: '➕',
  },
  {
    title: 'Edit Device',
    description: "Update a device's IP address.",
    path: '/operator/edit-device',
    icon: '✏️',
  },
  {
    title: 'Delete Device',
    description: 'Deactivate a device and remove it from monitoring.',
    path: '/operator/delete-device',
    icon: '🗑️',
  },
  {
    title: 'Report',
    description: 'View alarm counts grouped by severity or status.',
    path: '/operator/report',
    icon: '📊',
  },
];

export default function OperatorHomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>
          Welcome, {user?.username}!
        </h2>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          You are logged in as <strong>Operator</strong>. Use the tabs on the left or the
          shortcuts below to manage monitored devices.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {OPERATOR_FEATURES.map((f) => (
          <button
            key={f.path}
            type="button"
            className="card"
            onClick={() => navigate(f.path)}
            style={{
              textAlign: 'left',
              cursor: 'pointer',
              border: '1px solid var(--color-border)',
              transition: 'box-shadow 150ms ease, border-color 150ms ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>{f.icon}</div>
            <h3 style={{ marginBottom: 'var(--space-1)' }}>{f.title}</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              {f.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
