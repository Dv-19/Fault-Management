import { apiFetch } from './apiClient';
import {
  BulkActionResponse,
  ApiMessage,
  Fault,
  FaultReportSummaryItem,
  FaultStatus,
  PageResponse,
} from '../types/domain';

export interface ListFaultsParams {
  page: number;
  size?: number;
  deviceId?: number;
  severity?: string;
  status?: FaultStatus;
  search?: string;
}

export interface ReportParams {
  severity?: string;
  acknowledged?: boolean;
  cleared?: boolean;
  terminated?: boolean;
}

export const faultApi = {
  list: ({ page, size = 20, ...filters }: ListFaultsParams) =>
    apiFetch<PageResponse<Fault>>('/api/faults', { params: { page, size, ...filters } }),

  acknowledge: (faultId: number) =>
    apiFetch<ApiMessage>(`/api/faults/${faultId}/acknowledge`, { method: 'PATCH' }),

  clear: (faultId: number) =>
    apiFetch<ApiMessage>(`/api/faults/${faultId}/clear`, { method: 'PATCH' }),

  terminate: (faultId: number) =>
    apiFetch<ApiMessage>(`/api/faults/${faultId}/terminate`, { method: 'PATCH' }),

  bulkAcknowledge: (faultIds: number[]) =>
    apiFetch<BulkActionResponse>('/api/faults/actions/acknowledge', {
      method: 'PATCH',
      body: JSON.stringify({ faultIds }),
    }),

  bulkClear: (faultIds: number[]) =>
    apiFetch<BulkActionResponse>('/api/faults/actions/clear', {
      method: 'PATCH',
      body: JSON.stringify({ faultIds }),
    }),

  report: (params: ReportParams) =>
    apiFetch<Fault[]>('/api/faults/report', { params: params as Record<string, string> }),

  reportSummary: (category: string) =>
    apiFetch<FaultReportSummaryItem[]>('/api/faults/report/summary', { params: { category } }),
};
