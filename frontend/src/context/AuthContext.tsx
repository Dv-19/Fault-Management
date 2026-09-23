import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi, LoginRequest } from '../api/authApi';
import { onUnauthorized } from '../api/apiClient';
import { ApiError, CurrentUser } from '../types/domain';

interface AuthContextValue {
  user: CurrentUser | null;
  /** True only while the initial GET /api/auth/me bootstrap is in flight. */
  isBootstrapping: boolean;
  login: (credentials: LoginRequest) => Promise<CurrentUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((current) => {
        if (!cancelled) setUser(current);
      })
      .catch(() => {
        // 401 here just means "not logged in yet" — not an error to surface.
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsBootstrapping(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => onUnauthorized(() => setUser(null)), []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const { user: loggedInUser } = await authApi.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the server call fails, drop local session state so the
      // user isn't stuck on a protected screen with a dead session.
    } finally {
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

export function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'message' in value;
}

export function landingPathForRole(role: CurrentUser['role']): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'OPERATOR':
      return '/operator';
    case 'MANAGER':
      return '/manager';
    default:
      return '/login';
  }
}
