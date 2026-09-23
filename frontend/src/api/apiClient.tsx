import { API_BASE_URL } from '../config/env';
import { ApiError } from '../types/domain';

/**
 * Dispatched whenever a request comes back 401 so the rest of the app
 * (AuthContext) can clear user state and redirect to /login without this
 * module having to import React/router code.
 */
const UNAUTHORIZED_EVENT = 'auth:unauthorized';

function normalizeError(status: number, body: unknown): ApiError {
  if (body && typeof body === 'object' && 'message' in (body as object)) {
    const b = body as Partial<ApiError>;
    return {
      status,
      code: b.code ?? 'UNKNOWN_ERROR',
      message: b.message ?? 'Something went wrong. Please try again.',
      fieldErrors: b.fieldErrors,
      timestamp: b.timestamp,
    };
  }
  return {
    status,
    code: 'UNKNOWN_ERROR',
    message: 'Something went wrong. Please try again.',
  };
}

/**
 * CSRF handling is centralized here, deliberately left as a no-op until the
 * backend confirms the token/header mechanism (integration doc, section on
 * CSRF). Once confirmed, read the cookie here and set the header below —
 * no feature component should need to change.
 */
function applyCsrfHeader(_headers: Headers): void {
  // Example once confirmed:
  // const token = readCookie('XSRF-TOKEN');
  // if (token) headers.set('X-XSRF-TOKEN', token);
}

export interface ApiFetchOptions extends RequestInit {
  /** Query params to append, if any. */
  params?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(path: string, params?: ApiFetchOptions['params']): string {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  // Return path+search only when API_BASE_URL is relative-friendly; using
  // the full href keeps this correct whether API_BASE_URL is absolute.
  return url.toString();
}

export async function apiFetch<T>(path: string, init: ApiFetchOptions = {}): Promise<T> {
  const { params, ...rest } = init;
  const headers = new Headers(rest.headers);
  headers.set('Accept', 'application/json');
  if (rest.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  applyCsrfHeader(headers);

  const response = await fetch(buildUrl(path, params), {
    ...rest,
    credentials: 'include',
    headers,
  });

  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
  }

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // body wasn't JSON; fall through to the generic error
    }
    throw normalizeError(response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  // Some endpoints (e.g. XML import) never go through this client; every
  // JSON endpoint in this app is safe to parse directly.
  return (await response.json()) as Promise<T>;
}

export function onUnauthorized(handler: () => void): () => void {
  const listener = () => handler();
  window.addEventListener(UNAUTHORIZED_EVENT, listener);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, listener);
}
