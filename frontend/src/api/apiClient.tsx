/**
 * Central axios instance for all backend calls.
 *
 * Conventions (from frontend-backend-integration.md):
 *  - Base URL: http://localhost:8765
 *  - Every request must send credentials (JSESSIONID + XSRF-TOKEN cookies).
 *  - CSRF: on every POST/PUT/DELETE, read the XSRF-TOKEN cookie and send it
 *    as the X-XSRF-TOKEN header.
 *  - Auth: server-side session cookie — no JWT, no Authorization header.
 *  - 401 on a protected endpoint → session expired → redirect to login.
 *  - Error shape: { timestamp, status, error, message, path }
 *  - Success shape: { success, message, data }
 */
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// ---------------------------------------------------------------------------
// Instance
// ---------------------------------------------------------------------------

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8765',
  withCredentials: true, // sends JSESSIONID + XSRF-TOKEN cookies cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------------
// CSRF helper
// ---------------------------------------------------------------------------

function getCookie(name: string): string | null {
  const match = document.cookie.split('; ').find((c) => c.startsWith(name + '='));
  if (!match) return null;
  return decodeURIComponent(match.split('=')[1]);
}

/**
 * Attach X-XSRF-TOKEN on every state-changing request.
 * GET/HEAD/OPTIONS are CSRF-exempt by Spring Security default.
 */
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = config.method?.toUpperCase() ?? '';
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const token = getCookie('XSRF-TOKEN');
    if (token) {
      config.headers['X-XSRF-TOKEN'] = token;
    }
  }
  return config;
});

// ---------------------------------------------------------------------------
// 401 broadcast — AuthContext listens for this to clear user state
// ---------------------------------------------------------------------------

const UNAUTHORIZED_EVENT = 'auth:unauthorized';

export function onUnauthorized(handler: () => void): () => void {
  const listener = () => handler();
  window.addEventListener(UNAUTHORIZED_EVENT, listener);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, listener);
}

// ---------------------------------------------------------------------------
// Response interceptor — normalize errors + 403 CSRF retry
// ---------------------------------------------------------------------------

/**
 * On a 403 the backend cannot distinguish a CSRF token failure from a
 * genuine "wrong role" rejection (both return the same status + message).
 * Strategy (integration doc §2.2): refresh the CSRF cookie once and retry
 * the original request exactly once. If the retry is also 403, surface it
 * as a permission error.
 */
let csrfRetryInProgress = false;

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<BackendError>) => {
    const status = error.response?.status;

    if (status === 401) {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }

    if (status === 403 && !csrfRetryInProgress && error.config) {
      csrfRetryInProgress = true;
      try {
        // Refresh the XSRF-TOKEN cookie
        await apiClient.get('/api/auth/csrf');
        // Retry the original request once with the fresh token
        const retryConfig = { ...error.config, _csrfRetry: true };
        const retryResponse = await apiClient.request(retryConfig);
        return retryResponse;
      } catch (retryError) {
        // Retry also failed — fall through and surface as permission error
        return Promise.reject(normalizeError(retryError as AxiosError<BackendError>));
      } finally {
        csrfRetryInProgress = false;
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

// ---------------------------------------------------------------------------
// Error normalization
// ---------------------------------------------------------------------------

export interface ApiError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
}

interface BackendError {
  status?: number;
  message?: string;
  error?: string;
  timestamp?: string;
  path?: string;
}

/**
 * Parse the backend's ErrorResponseDto into a plain ApiError.
 * Also parse bean-validation field errors from the "; "-joined message format:
 *   "username: Username is required; password: Password is required"
 */
function normalizeError(error: AxiosError<BackendError>): ApiError {
  if (!error.response) {
    return {
      status: 0,
      message: 'Unable to reach the server. Please try again.',
    };
  }

  const { status, data } = error.response;
  const message = data?.message ?? 'Something went wrong. Please try again.';

  // Try to parse field errors out of the "; "-joined validation message
  const fieldErrors: Record<string, string> = {};
  if (status === 400 && message.includes(': ')) {
    message.split('; ').forEach((part) => {
      const colonIdx = part.indexOf(': ');
      if (colonIdx !== -1) {
        const field = part.substring(0, colonIdx).trim();
        const text = part.substring(colonIdx + 2).trim();
        // Skip query-param validation messages like "getAllUsers.page: ..."
        if (!field.includes('.')) {
          fieldErrors[field] = text;
        }
      }
    });
  }

  return {
    status,
    message,
    fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
  };
}

export function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'message' in value && 'status' in value;
}

// ---------------------------------------------------------------------------
// CSRF bootstrap — call once at app start before the first POST
// ---------------------------------------------------------------------------

export async function initCsrf(): Promise<void> {
  await apiClient.get('/api/auth/csrf');
}

export default apiClient;
