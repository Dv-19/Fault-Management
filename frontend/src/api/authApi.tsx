/**
 * Auth API — matches AuthAPI.java + UserAPI.java exactly.
 *
 * Endpoints:
 *   GET  /api/auth/csrf                       — bootstrap XSRF-TOKEN cookie
 *   POST /api/auth/login                      — login
 *   POST /api/auth/logout                     — logout
 *   POST /api/auth/forgot-password/question   — step 1: get secret question
 *   POST /api/auth/forgot-password/verify     — step 2: verify answer
 *   POST /api/auth/forgot-password/reset      — step 3: reset password
 *   PUT  /api/users/change-password           — change own password (authenticated)
 *
 * IMPORTANT — change-password 401 handling:
 *   A wrong current password returns 401. This must NOT trigger the global
 *   auth:unauthorized event (which clears the session). The caller
 *   (ChangePasswordDialog) catches the error locally and checks the message.
 *   To prevent the global interceptor from firing, changePassword() uses
 *   validateStatus to prevent axios from treating 401 as an error on this
 *   specific call, and the caller handles non-2xx responses manually.
 */
import apiClient from './apiClient';
import { ApiResponse, CurrentUser, SecretQuestion } from '../types/domain';

// ---------------------------------------------------------------------------
// Request / Response shapes
// ---------------------------------------------------------------------------

export interface LoginRequest {
  username: string;
  password: string;
}

/** LoginResponseDto from the backend */
export interface LoginResponseData {
  username: string;
  role: string;
  /** Welcome message, e.g. "Welcome, admin1! You are logged in as ADMIN." */
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordStep1Request {
  username: string;
}

/** ForgotPasswordStep2RequestDto — field is 'answer' not 'secretAnswer' */
export interface ForgotPasswordStep2Request {
  username: string;
  answer: string;
}

/** ResetPasswordRequestDto */
export interface ForgotPasswordResetRequest {
  username: string;
  newPassword: string;
  confirmPassword: string;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

export const authApi = {
  /** GET /api/auth/csrf — call once at app start before any POST/PUT/DELETE */
  initCsrf: () =>
    apiClient.get<ApiResponse<null>>('/api/auth/csrf'),

  /** POST /api/auth/login — 401 wrong credentials, 403 deactivated */
  login: (payload: LoginRequest) =>
    apiClient.post<ApiResponse<LoginResponseData>>('/api/auth/login', payload),

  /** POST /api/auth/logout — no body */
  logout: () =>
    apiClient.post<ApiResponse<null>>('/api/auth/logout'),

  /**
   * PUT /api/users/change-password
   *
   * Uses validateStatus so a 401 (wrong current password) does NOT trigger
   * the global auth:unauthorized interceptor and log the user out.
   * The caller receives the raw AxiosResponse and handles error status itself.
   */
  changePassword: (payload: ChangePasswordRequest) =>
    apiClient.put<ApiResponse<null>>('/api/users/change-password', payload, {
      validateStatus: () => true, // never throw — let caller check .status
    }),

  /**
   * POST /api/auth/forgot-password/question
   * Returns SecretQuestion enum string in data (e.g. "FIRST_PET").
   * 404 if username not found.
   */
  forgotPasswordQuestion: (payload: ForgotPasswordStep1Request) =>
    apiClient.post<ApiResponse<SecretQuestion>>('/api/auth/forgot-password/question', payload),

  /**
   * POST /api/auth/forgot-password/verify
   * Sets a short-lived server-side session flag (5 min TTL).
   * 400 if answer wrong, 404 if user not found.
   */
  forgotPasswordVerify: (payload: ForgotPasswordStep2Request) =>
    apiClient.post<ApiResponse<null>>('/api/auth/forgot-password/verify', payload),

  /**
   * POST /api/auth/forgot-password/reset
   * Requires verify step first. 400 if expired (>5 min), 400 if mismatch.
   */
  forgotPasswordReset: (payload: ForgotPasswordResetRequest) =>
    apiClient.post<ApiResponse<null>>('/api/auth/forgot-password/reset', payload),
};

// ---------------------------------------------------------------------------
// Session storage helpers (no /me endpoint — persist login state manually)
// ---------------------------------------------------------------------------

const SESSION_KEY = 'fmd_user';

export function saveSession(user: CurrentUser): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function loadSession(): CurrentUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
