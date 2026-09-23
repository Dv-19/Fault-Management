import { apiFetch } from './apiClient';
import { ApiMessage, Device, DeviceState, PageResponse } from '../types/domain';

export interface CreateDeviceRequest {
  serialNumber: string;
  ipAddress: string;
  deviceType: string;
}

// US13 in the latest SRS: "Operator can edit the device details like
// device IP address and device serial number... Device serial number,
// Device IP, should be filled according to whichever device you are trying
// to edit and all the other text box (device type) should be non-editable."
// This supersedes the earlier integration doc, which only allowed editing
// the IP. The original serial number is still the lookup key in the URL;
// `serialNumber` in the payload is only sent when it actually changed.
export interface EditDeviceRequest {
  serialNumber?: string;
  ipAddress: string;
}

export interface ListDevicesParams {
  page: number;
  size?: number;
  state?: DeviceState;
}

// Ownership/filter semantics are a pending decision (integration doc #4).
// Keeping every device query behind this module means that, whichever way
// it resolves, only this file changes.
export const deviceApi = {
  list: ({ page, size = 10, state = 'ACTIVATED' }: ListDevicesParams) =>
    apiFetch<PageResponse<Device>>('/api/devices', { params: { page, size, state } }),

  add: (payload: CreateDeviceRequest) =>
    apiFetch<ApiMessage>('/api/devices', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** originalSerialNumber is the lookup key; payload carries the new values. */
  edit: (originalSerialNumber: string, payload: EditDeviceRequest) =>
    apiFetch<ApiMessage>(`/api/devices/${encodeURIComponent(originalSerialNumber)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deactivate: (serialNumber: string) =>
    apiFetch<ApiMessage>(`/api/devices/${encodeURIComponent(serialNumber)}/deactivate`, {
      method: 'PATCH',
    }),
};

// Values the SRS explicitly calls out as invalid; enforce client-side too,
// while still treating any backend field error as authoritative.
const REJECTED_IPS = new Set(['0.0.0.0', '255.255.255.255']);
const IPV4_PATTERN =
  /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

export function validateIpAddress(value: string): string | null {
  if (!value.trim()) return 'IP address is required.';
  if (!IPV4_PATTERN.test(value.trim())) return 'Enter a valid IPv4 address.';
  if (REJECTED_IPS.has(value.trim())) return 'This IP address is not allowed.';
  return null;
}
