import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordDialog from '../account/ChangePasswordDialog';
import {
  BrandMark,
  LockIcon,
  LogoutIcon,
  ReportIcon,
  RouterIcon,
  AlarmIcon,
  UsersIcon,
  HomeIcon,
} from './icons';
import './layout.css';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const ROLE_LINKS: Record<string, NavItem[]> = {
  ADMIN: [
    { to: '/admin/home',        label: 'Home',        icon: <HomeIcon /> },
    { to: '/admin/users',       label: 'User Details',icon: <UsersIcon /> },
    { to: '/admin/add-user',    label: 'Add User',    icon: <UsersIcon /> },
    { to: '/admin/delete-user', label: 'Delete User', icon: <UsersIcon /> },
    { to: '/admin/report',      label: 'Report',      icon: <ReportIcon /> },
  ],
  OPERATOR: [
    { to: '/operator/home',          label: 'Home',          icon: <HomeIcon /> },
    { to: '/operator/devices',       label: 'Device List',   icon: <RouterIcon /> },
    { to: '/operator/add-device',    label: 'Add Device',    icon: <RouterIcon /> },
    { to: '/operator/edit-device',   label: 'Edit Device',   icon: <RouterIcon /> },
    { to: '/operator/delete-device', label: 'Delete Device', icon: <RouterIcon /> },
    { to: '/operator/report',        label: 'Report',        icon: <ReportIcon /> },
  ],
  MANAGER: [
    { to: '/manager/home',   label: 'Home',          icon: <HomeIcon /> },
    { to: '/manager/faults', label: 'Fault Handling',icon: <AlarmIcon /> },
    { to: '/manager/report', label: 'Report',        icon: <ReportIcon /> },
  ],
};

const PAGE_TITLES: Record<string, string> = {
  '/admin/home':          'Home',
  '/admin/users':         'User details',
  '/admin/add-user':      'Add user',
  '/admin/delete-user':   'Delete user',
  '/admin/report':        'Report',
  '/operator/home':       'Home',
  '/operator/devices':    'Device list',
  '/operator/add-device': 'Add device',
  '/operator/edit-device':'Edit device',
  '/operator/delete-device':'Delete device',
  '/operator/report':     'Report',
  '/manager/home':        'Home',
  '/manager/faults':      'Fault handling',
  '/manager/report':      'Report',
};

function initials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const links = user ? ROLE_LINKS[user.role] ?? [] : [];
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Fault Management Dashboard';
  // Home is always first link
  const homePath = links[0]?.to ?? '/login';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true, state: { loggedOut: true } });
  };

  const handlePasswordChanged = async (message: string) => {
    setChangePasswordOpen(false);
    await logout();
    navigate('/login', { replace: true, state: { message } });
  };

  return (
    <div className="console-shell">
      <aside className="console-sidebar">
        <button
          type="button"
          className="console-brand"
          onClick={() => navigate(homePath)}
          aria-label="Go to home"
        >
          <BrandMark size={34} />
          <div className="console-brand-text console-nav-label">
            <span className="console-brand-title">Fault Management</span>
            <span className="console-brand-subtitle">Network Operations Console</span>
          </div>
        </button>

        <nav className="console-nav" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              title={link.label}
              className={({ isActive }) =>
                isActive ? 'console-nav-link active' : 'console-nav-link'
              }
            >
              <span className="console-nav-icon">{link.icon}</span>
              <span className="console-nav-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="console-user">
            <div className="console-user-row">
              <span className="console-avatar">{initials(user.username)}</span>
              <div className="console-user-meta console-nav-label">
                <span className="console-username">{user.username}</span>
                <span className="console-role-tag">{user.role}</span>
              </div>
            </div>
            <button
              type="button"
              className="console-user-action"
              onClick={() => setChangePasswordOpen(true)}
            >
              <LockIcon size={16} />
              <span className="console-nav-label">Change password</span>
            </button>
            <button
              type="button"
              className="console-user-action console-logout"
              onClick={handleLogout}
            >
              <LogoutIcon size={16} />
              <span className="console-nav-label">Log out</span>
            </button>
          </div>
        )}
      </aside>

      <div className="console-main">
        <header className="console-topbar">
          <div>
            <p className="console-eyebrow">
              {user?.role
                ? `${user.role.charAt(0)}${user.role.slice(1).toLowerCase()} workspace`
                : 'Workspace'}
            </p>
            <h1 className="console-page-title">{pageTitle}</h1>
          </div>
          <div className="console-topbar-status">
            <span className="console-live-dot" aria-hidden="true" />
            Live monitoring
          </div>
        </header>
        <main className="console-content">
          <Outlet />
        </main>
      </div>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        onSuccess={handlePasswordChanged}
      />
    </div>
  );
}
