import { apiFetch } from './apiClient';
import { ApiMessage, PageResponse, Role, UserSummary } from '../types/domain';

export interface CreateUserRequest {
  username: string;
  password: string;
  confirmPassword: string;
  role: Role;
  securityQuestionId: number;
  securityAnswer: string;
}

export const userApi = {
  list: (page: number, size = 10) =>
    apiFetch<PageResponse<UserSummary>>('/api/users', { params: { page, size } }),

  create: (payload: CreateUserRequest) =>
    apiFetch<ApiMessage>('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  changeRole: (username: string, role: Role) =>
    apiFetch<ApiMessage>(`/api/users/${encodeURIComponent(username)}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  deactivate: (userId: number) =>
    apiFetch<ApiMessage>(`/api/users/${userId}/deactivate`, { method: 'PATCH' }),
};
