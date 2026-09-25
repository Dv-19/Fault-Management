/**
 * Admin Home Page (FE US02).
 * SRS: After login, ADMIN lands here. Shows the welcome message from login
 * and a summary of available tabs.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ADMIN_FEATURES = [
  {
    title: 'User Details',
    description: 'View all registered users, their roles and account states.',
    path: '/admin/users',
    icon: '👥',
  },
  {
    title: 'Add User',
    description: 'Register a new Admin, Operator or Manager account.',
    path: '/admin/add-user',
    icon: '➕',
  },
  {
    title: 'Delete User',
    description: 'Deactivate a user account. The record is preserved.',
    path: '/admin/delete-user',
    icon: '🗑️',
  },
  {
    title: 'Report',
    description: 'View alarm counts grouped by severity or status.',
    path: '/admin/report',
    icon: '📊',
  },
];

export default function AdminHomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>
          Welcome, {user?.username}!
        </h2>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          You are logged in as <strong>Administrator</strong>. Use the tabs on the left or the
          shortcuts below to manage users and view reports.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {ADMIN_FEATURES.map((f) => (
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
