// Shared domain types for the Fault Management Dashboard.
// Source of truth: FRONTEND_BACKEND_INTEGRATION.md sections 3, 5-8.
// Values marked "pending" trace back to an unresolved decision in that doc —
// keep them isolated here so a later change only touches one file.

export type UserState = 'ACTIVATED' | 'DEACTIVATED';
export type DeviceState = 'ACTIVATED' | 'DEACTIVATED';
export type FaultStatus = 'OPEN' | 'ACKNOWLEDGED' | 'CLEARED' | 'TERMINATED';

/**
 * Explicit backend source values are ADMIN / OPERATOR / MANAGER.
 * "VIEW" shows up in one source as a possible 4th role but is not confirmed
 * to be distinct from MANAGER (see integration doc, open decision #1).
 * Do not branch UI logic on a 'VIEW' role until that is resolved.
 */
export type Role = 'ADMIN' | 'OPERATOR' | 'MANAGER';

/**
 * Confirm this vocabulary with backend/product before it's treated as final
 * (integration doc, open decision #7). Kept as a union + string fallback on
 * the Fault type so an unrecognized value never crashes the UI.
 */
export type FaultSeverity = 'CLEAR' | 'WARNING' | 'MAJOR' | 'SEVERE' | 'CRITICAL';

export interface ApiMessage {
  message: string;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
  timestamp?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number; // zero-based, as returned by the API
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CurrentUser {
  userId: number;
  username: string;
  role: Role;
  userState: UserState;
  mustChangePassword?: boolean; // pending first-login policy
}

export interface UserSummary {
  userId: number;
  username: string;
  role: Role;
  userState: UserState;
}

export interface Device {
  deviceId: number;
  serialNumber: string;
  ipAddress: string;
  deviceType: string; // controlled list not yet specified by backend
  deviceState: DeviceState;
  configuredByUserId?: number; // pending ownership decision
}

export interface Fault {
  faultId: number;
  deviceId?: number;
  deviceIp: string;
  deviceSerialNumber: string;
  deviceType: string;
  alarmName: string;
  severity: FaultSeverity | string;
  status: FaultStatus;
  isAcknowledged: boolean;
  notes?: string;
  occurrence?: number | string;
  firstTimeDetected?: string;
  lastTimeDetected?: string;
  acknowledgedBy?: string;
  clearedBy?: string;
  canAcknowledge: boolean;
  canClear: boolean;
  canTerminate: boolean;
}

export interface FaultActionResult {
  faultId: number;
  success: boolean;
  message: string;
}

export interface BulkActionResponse {
  results?: FaultActionResult[]; // per-item outcome, if the backend supports it
  message?: string; // fallback, in case the backend responds all-or-nothing
}

export interface FaultReportSummaryItem {
  category: string;
  count: number;
}

/** Type guard so components can render a safe fallback for unknown values. */
export function isKnownSeverity(value: string): value is FaultSeverity {
  return ['CLEAR', 'WARNING', 'MAJOR', 'SEVERE', 'CRITICAL'].includes(value);
}
