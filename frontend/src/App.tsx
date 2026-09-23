import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import AppLayout from './components/layout/AppLayout';

import LoginPage from './pages/Login/LoginPage';
import ForgotPasswordPage from './pages/ForgotPassword/ForgotPasswordPage';
import AdminUsersPage from './pages/Admin/AdminUsersPage';
import AdminAddUserPage from './pages/Admin/AdminAddUserPage';
import AdminDeleteUserPage from './pages/Admin/AdminDeleteUserPage';
import AdminReportPage from './pages/Admin/AdminReportPage';
import OperatorDevicesPage from './pages/Operator/OperatorDevicesPage';
import OperatorAddDevicePage from './pages/Operator/OperatorAddDevicePage';
import OperatorEditDevicePage from './pages/Operator/OperatorEditDevicePage';
import OperatorDeleteDevicePage from './pages/Operator/OperatorDeleteDevicePage';
import OperatorReportPage from './pages/Operator/OperatorReportPage';
import ManagerFaultsPage from './pages/Manager/ManagerFaultsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Change password is a pop-up (US09), not a route — see
                  components/account/ChangePasswordDialog, opened from
                  AppLayout's sidebar. */}

              <Route element={<RoleRoute allow={['ADMIN']} />}>
                <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/add-user" element={<AdminAddUserPage />} />
                <Route path="/admin/delete-user" element={<AdminDeleteUserPage />} />
                <Route path="/admin/report" element={<AdminReportPage />} />
              </Route>

              <Route element={<RoleRoute allow={['OPERATOR']} />}>
                <Route path="/operator" element={<Navigate to="/operator/devices" replace />} />
                <Route path="/operator/devices" element={<OperatorDevicesPage />} />
                <Route path="/operator/add-device" element={<OperatorAddDevicePage />} />
                <Route path="/operator/edit-device" element={<OperatorEditDevicePage />} />
                <Route path="/operator/delete-device" element={<OperatorDeleteDevicePage />} />
                <Route path="/operator/report" element={<OperatorReportPage />} />
              </Route>

              <Route element={<RoleRoute allow={['MANAGER']} />}>
                <Route path="/manager" element={<Navigate to="/manager/faults" replace />} />
                <Route path="/manager/faults" element={<ManagerFaultsPage />} />
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
