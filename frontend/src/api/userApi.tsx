/**
 * User management API — ADMIN only.
 *
 * GET  /api/users?page={n}&search={q}  — PagedResponse<UserSummary>
 * POST /api/users
 * PUT  /api/users/role
 * PUT  /api/users/deactivate
 * PUT  /api/users/activate              (A1)
 */
import apiClient from './apiClient';
import { ApiResponse, PagedResponse, Role, SecretQuestion, UserSummary } from '../types/domain';

export interface CreateUserRequest {
  username: string;
  password: string;
  role: Role;
  secretQuestion: SecretQuestion;
  secretAnswer: string;
}

export interface ChangeRoleRequest {
  username: string;
  newRole: Role;
}

export interface DeactivateUserRequest {
  username: string;
}

export interface ActivateUserRequest {
  username: string;
}

export const userApi = {
  /**
   * GET /api/users?page={n}&search={q}
   * Returns PagedResponse<UserSummary> — use content[], totalPages, totalElements.
   * search is optional: case-insensitive partial match on username.
   */
  list: (page: number, search?: string) =>
    apiClient.get<ApiResponse<PagedResponse<UserSummary>>>('/api/users', {
      params: { page, ...(search ? { search } : {}) },
    }),

  create: (payload: CreateUserRequest) =>
    apiClient.post<ApiResponse<UserSummary>>('/api/users', payload),

  changeRole: (payload: ChangeRoleRequest) =>
    apiClient.put<ApiResponse<null>>('/api/users/role', payload),

  deactivate: (payload: DeactivateUserRequest) =>
    apiClient.put<ApiResponse<null>>('/api/users/deactivate', payload),

  /** A1 — reactivate a DEACTIVATED user */
  activate: (payload: ActivateUserRequest) =>
    apiClient.put<ApiResponse<null>>('/api/users/activate', payload),
};
