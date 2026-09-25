/**
 * Domain types aligned exactly to the backend DTOs and integration doc.
 * Field names match what the backend actually sends/expects.
 */

// ---------------------------------------------------------------------------
// Enums (sent/received as exact uppercase strings)
// ---------------------------------------------------------------------------

export type Role = 'ADMIN' | 'OPERATOR' | 'MANAGER';
export type UserState = 'ACTIVATED' | 'DEACTIVATED';
export type DeviceType = 'HUB' | 'SWITCH' | 'ROUTER';
export type DeviceState = 'ACTIVATED' | 'DEACTIVATED';

/** Severity enum — matches backend com.infy.enums.Severity */
export type Severity = 'CLEAR' | 'WARNING' | 'MAJOR' | 'SEVERE' | 'CRITICAL';

/** AlarmStatus enum — matches backend com.infy.enums.AlarmStatus */
export type AlarmStatus = 'UNACKNOWLEDGED' | 'ACKNOWLEDGED' | 'CLEARED' | 'TERMINATED';

export type SecretQuestion =
  | 'FIRST_PET'
  | 'BIRTH_CITY'
  | 'FAVOURITE_TEACHER'
  | 'MOTHERS_MAIDEN_NAME'
  | 'FAVOURITE_BOOK';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface CurrentUser {
  username: string;
  role: Role;
}

// ---------------------------------------------------------------------------
// Generic API wrappers
// ---------------------------------------------------------------------------

/**
 * ApiResponseDto<T> — every success response from the backend.
 */
export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * PagedResponseDto<T> — returned by every paginated list endpoint.
 * Fields match PagedResponseDto.java exactly.
 */
export interface PagedResponse<T> {
  content: T[];
  page: number;       // zero-based current page
  size: number;       // page size (10)
  totalElements: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface UserSummary {
  id: number;
  username: string;
  role: Role;
  userState: UserState;
}

// ---------------------------------------------------------------------------
// Devices
// ---------------------------------------------------------------------------

export interface Device {
  id: number;
  serialNumber: string;
  ipAddress: string;
  deviceType: DeviceType;
  deviceState: DeviceState;
}

// ---------------------------------------------------------------------------
// Alarms
// ---------------------------------------------------------------------------

/**
 * LocalDateTime from Jackson with write-dates-as-timestamps=true (default)
 * arrives as a number array: [year, month, day, hour, minute, second, nano].
 * With write-dates-as-timestamps=false it arrives as an ISO string.
 * We accept both.
 */
export type JavaLocalDateTime = string | number[] | null;

export interface Alarm {
  id: number;
  deviceIp: string;
  serialNumber: string;
  deviceType: DeviceType;
  severity: Severity;
  trap: string;
  notes: string | null;
  occurrence: number;
  status: AlarmStatus;

  // A3: Audit trail — null until that lifecycle step happens
  acknowledgedBy: string | null;
  acknowledgedAt: JavaLocalDateTime;
  clearedBy: string | null;
  clearedAt: JavaLocalDateTime;
  terminatedBy: string | null;
  terminatedAt: JavaLocalDateTime;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isKnownSeverity(value: string): value is Severity {
  return ['CLEAR', 'WARNING', 'MAJOR', 'SEVERE', 'CRITICAL'].includes(value);
}

/**
 * Convert a JavaLocalDateTime (ISO string or number array) to a JS Date.
 * Returns null if value is null/undefined.
 */
export function parseJavaDateTime(value: JavaLocalDateTime): Date | null {
  if (!value) return null;
  if (typeof value === 'string') return new Date(value);
  // array: [year, month(1-based), day, hour, minute, second, nano?]
  const [y, mo, d, h = 0, mi = 0, s = 0, nano = 0] = value as number[];
  return new Date(y, mo - 1, d, h, mi, s, Math.floor(nano / 1_000_000));
}
