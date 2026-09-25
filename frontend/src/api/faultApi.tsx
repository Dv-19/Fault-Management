/**
 * Alarm / Fault management API.
 *
 * GET  /api/alarms?page&deviceIp&severity&status  — PagedResponse<Alarm>
 * PUT  /api/alarms/{id}/acknowledge               — MANAGER only
 * PUT  /api/alarms/acknowledge/bulk               — MANAGER only
 * PUT  /api/alarms/{id}/clear                     — MANAGER only
 * PUT  /api/alarms/clear/bulk                     — MANAGER only
 * PUT  /api/alarms/{id}/terminate                 — MANAGER only
 * PUT  /api/alarms/{id}/notes                     — MANAGER only
 *
 * A4: GET /api/alarms/stream — SSE, any authenticated role (when backend adds it)
 */
import apiClient from './apiClient';
import { Alarm, AlarmStatus, ApiResponse, PagedResponse, Severity } from '../types/domain';

export interface ListAlarmsParams {
  page: number;
  deviceIp?: string;
  severity?: Severity;
  status?: AlarmStatus;
}

export interface BulkAlarmActionRequest {
  alarmIds: number[];
}

export interface AlarmNotesRequest {
  notes: string;
}

export const faultApi = {
  /**
   * GET /api/alarms
   * Returns PagedResponse<Alarm> — use content[], totalPages.
   */
  list: ({ page, deviceIp, severity, status }: ListAlarmsParams) => {
    const params: Record<string, string | number> = { page };
    if (deviceIp) params.deviceIp = deviceIp;
    if (severity) params.severity = severity;
    if (status)   params.status   = status;
    return apiClient.get<ApiResponse<PagedResponse<Alarm>>>('/api/alarms', { params });
  },

  acknowledge: (id: number) =>
    apiClient.put<ApiResponse<null>>(`/api/alarms/${id}/acknowledge`),

  clear: (id: number) =>
    apiClient.put<ApiResponse<null>>(`/api/alarms/${id}/clear`),

  terminate: (id: number) =>
    apiClient.put<ApiResponse<null>>(`/api/alarms/${id}/terminate`),

  bulkAcknowledge: (alarmIds: number[]) =>
    apiClient.put<ApiResponse<null>>('/api/alarms/acknowledge/bulk', {
      alarmIds,
    } satisfies BulkAlarmActionRequest),

  bulkClear: (alarmIds: number[]) =>
    apiClient.put<ApiResponse<null>>('/api/alarms/clear/bulk', {
      alarmIds,
    } satisfies BulkAlarmActionRequest),

  updateNotes: (id: number, notes: string) =>
    apiClient.put<ApiResponse<null>>(`/api/alarms/${id}/notes`, {
      notes,
    } satisfies AlarmNotesRequest),
};

export function alarmActions(status: AlarmStatus) {
  return {
    canAcknowledge: status === 'UNACKNOWLEDGED',
    canClear:       status === 'ACKNOWLEDGED',
    canTerminate:   status === 'ACKNOWLEDGED' || status === 'CLEARED',
  };
}
