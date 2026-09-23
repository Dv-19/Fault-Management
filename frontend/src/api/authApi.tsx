import { apiFetch } from './apiClient';
import { ApiMessage, CurrentUser } from '../types/domain';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: CurrentUser;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  captchaResponse: string;
}

export interface ForgotPasswordQuestionRequest {
  username: string;
}

export interface ForgotPasswordQuestionResponse {
  username: string;
  securityQuestionId: number;
  question: string;
}

export interface ForgotPasswordResetRequest {
  username: string;
  securityQuestionId: number;
  answer: string;
  newPassword: string;
  confirmPassword: string;
}

export const authApi = {
  login: (payload: LoginRequest) =>
    apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () => apiFetch<CurrentUser>('/api/auth/me'),

  logout: () => apiFetch<ApiMessage>('/api/auth/logout', { method: 'POST' }),

  changePassword: (payload: ChangePasswordRequest) =>
    apiFetch<ApiMessage>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  forgotPasswordQuestion: (payload: ForgotPasswordQuestionRequest) =>
    apiFetch<ForgotPasswordQuestionResponse>('/api/auth/forgot-password/question', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  forgotPasswordReset: (payload: ForgotPasswordResetRequest) =>
    apiFetch<ApiMessage>('/api/auth/forgot-password/reset', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
