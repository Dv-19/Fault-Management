/**
 * Device management API — OPERATOR only.
 *
 * GET  /api/devices?page={n}&state={s}&search={q}  — PagedResponse<Device>
 * POST /api/devices
 * PUT  /api/devices
 * PUT  /api/devices/deactivate
 * PUT  /api/devices/activate                         (A1)
 */
import apiClient from './apiClient';
import { ApiResponse, Device, DeviceState, PagedResponse } from '../types/domain';

export interface CreateDeviceRequest {
  serialNumber: string;
  ipAddress: string;
  deviceType: string;
}

export interface EditDeviceRequest {
  serialNumber: string;
  newIpAddress: string;
}

export interface DeactivateDeviceRequest {
  serialNumber: string;
}

export interface ActivateDeviceRequest {
  serialNumber: string;
}

export const deviceApi = {
  /**
   * GET /api/devices?page={n}&state={ACTIVATED|DEACTIVATED}&search={q}
   * Returns PagedResponse<Device>. state defaults to ACTIVATED when omitted.
   * search is case-insensitive partial match on serialNumber or ipAddress.
   */
  list: (page: number, state?: DeviceState, search?: string) =>
    apiClient.get<ApiResponse<PagedResponse<Device>>>('/api/devices', {
      params: {
        page,
        ...(state ? { state } : {}),
        ...(search ? { search } : {}),
      },
    }),

  add: (payload: CreateDeviceRequest) =>
    apiClient.post<ApiResponse<Device>>('/api/devices', payload),

  edit: (payload: EditDeviceRequest) =>
    apiClient.put<ApiResponse<null>>('/api/devices', payload),

  deactivate: (payload: DeactivateDeviceRequest) =>
    apiClient.put<ApiResponse<null>>('/api/devices/deactivate', payload),

  /** A1 — reactivate a DEACTIVATED device */
  activate: (payload: ActivateDeviceRequest) =>
    apiClient.put<ApiResponse<null>>('/api/devices/activate', payload),
};

// ---------------------------------------------------------------------------
// Client-side IP validation (mirrors backend rules)
// ---------------------------------------------------------------------------

const REJECTED_IPS = new Set(['0.0.0.0', '255.255.255.255']);
const IPV4_PATTERN =
  /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

export function validateIpAddress(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'IP address is required.';
  if (!IPV4_PATTERN.test(trimmed))
    return 'Invalid IP address. Enter a valid IPv4 address.';
  if (REJECTED_IPS.has(trimmed))
    return 'Invalid IP address. Enter a valid IPv4 address (0.0.0.0 and 255.255.255.255 are not allowed).';
  return null;
}

export const DEVICE_TYPES: string[] = ['HUB', 'SWITCH', 'ROUTER'];
