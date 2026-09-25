import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import AppLayout from './components/layout/AppLayout';
import { initCsrf } from './api/apiClient';

import LoginPage from './pages/Login/LoginPage';
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPasswordPage';

// Admin
import AdminHomePage from './pages/Admin/AdminHomePage';
import AdminUsersPage from './pages/Admin/AdminUsersPage';
import AdminAddUserPage from './pages/Admin/AdminAddUserPage';
import AdminDeleteUserPage from './pages/Admin/AdminDeleteUserPage';
import AdminReportPage from './pages/Admin/AdminReportPage';

// Operator
import OperatorHomePage from './pages/Operator/OperatorHomePage';
import OperatorDevicesPage from './pages/Operator/OperatorDevicesPage';
import OperatorAddDevicePage from './pages/Operator/OperatorAddDevicePage';
import OperatorEditDevicePage from './pages/Operator/OperatorEditDevicePage';
import OperatorDeleteDevicePage from './pages/Operator/OperatorDeleteDevicePage';
import OperatorReportPage from './pages/Operator/OperatorReportPage';

// Manager
import ManagerHomePage from './pages/Manager/ManagerHomePage';
import ManagerFaultsPage from './pages/Manager/ManagerFaultsPage';
import ManagerReportPage from './pages/Manager/ManagerReportPage';

export default function App() {
  // Bootstrap the XSRF-TOKEN cookie before any POST/PUT/DELETE (including login).
  useEffect(() => {
    initCsrf().catch(() => {});
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>

              {/* ── Admin ── */}
              <Route element={<RoleRoute allow={['ADMIN']} />}>
                <Route path="/admin" element={<Navigate to="/admin/home" replace />} />
                <Route path="/admin/home" element={<AdminHomePage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/add-user" element={<AdminAddUserPage />} />
                <Route path="/admin/delete-user" element={<AdminDeleteUserPage />} />
                <Route path="/admin/report" element={<AdminReportPage />} />
              </Route>

              {/* ── Operator ── */}
              <Route element={<RoleRoute allow={['OPERATOR']} />}>
                <Route path="/operator" element={<Navigate to="/operator/home" replace />} />
                <Route path="/operator/home" element={<OperatorHomePage />} />
                <Route path="/operator/devices" element={<OperatorDevicesPage />} />
                <Route path="/operator/add-device" element={<OperatorAddDevicePage />} />
                <Route path="/operator/edit-device" element={<OperatorEditDevicePage />} />
                <Route path="/operator/delete-device" element={<OperatorDeleteDevicePage />} />
                <Route path="/operator/report" element={<OperatorReportPage />} />
              </Route>

              {/* ── Manager ── */}
              <Route element={<RoleRoute allow={['MANAGER']} />}>
                <Route path="/manager" element={<Navigate to="/manager/home" replace />} />
                <Route path="/manager/home" element={<ManagerHomePage />} />
                <Route path="/manager/faults" element={<ManagerFaultsPage />} />
                <Route path="/manager/report" element={<ManagerReportPage />} />
              </Route>

            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
