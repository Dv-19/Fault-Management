/**
 * AuthContext — global authentication state.
 *
 * The backend has NO /me or session-check endpoint (integration doc §11 point 1).
 * Strategy:
 *   - On login, store { username, role } in sessionStorage.
 *   - On mount, read sessionStorage to restore the session without a round-trip.
 *   - On any 401 from a protected endpoint, clear state and redirect to /login.
 *   - On logout, call the server, then clear sessionStorage + state.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  authApi,
  LoginRequest,
  clearSession,
  loadSession,
  saveSession,
} from '../api/authApi';
import { onUnauthorized } from '../api/apiClient';
import { CurrentUser } from '../types/domain';

interface AuthContextValue {
  user: CurrentUser | null;
  /**
   * True only during the very first render tick before sessionStorage is read.
   * Kept to avoid a flash of the login redirect on page refresh.
   */
  isBootstrapping: boolean;
  login: (credentials: LoginRequest) => Promise<CurrentUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // Restore session from sessionStorage on mount (synchronous — no flicker)
  useEffect(() => {
    const stored = loadSession();
    if (stored) setUser(stored);
    setIsBootstrapping(false);
  }, []);

  // Any 401 from a protected endpoint clears the session
  useEffect(
    () =>
      onUnauthorized(() => {
        clearSession();
        setUser(null);
      }),
    [],
  );

  const login = useCallback(async (credentials: LoginRequest): Promise<CurrentUser> => {
    const res = await authApi.login(credentials);
    const data = res.data.data; // ApiResponse<LoginResponseData>
    const currentUser: CurrentUser = {
      username: data.username,
      role: data.role as CurrentUser['role'],
    };
    saveSession(currentUser);
    setUser(currentUser);
    return currentUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the server call fails, clear local state so the user
      // isn't stuck on a protected screen with a dead session.
    } finally {
      clearSession();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isBootstrapping, login, logout }),
    [user, isBootstrapping, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

/** Type guard — works with the normalized ApiError from apiClient */
export function isApiError(value: unknown): value is { status: number; message: string; fieldErrors?: Record<string, string> } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    'status' in value
  );
}

export function landingPathForRole(role: CurrentUser['role']): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/home';
    case 'OPERATOR':
      return '/operator/home';
    case 'MANAGER':
      return '/manager/home';
    default:
      return '/login';
  }
}
