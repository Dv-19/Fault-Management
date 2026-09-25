/**
 * Reports API — Phase 5, now implemented in the backend.
 *
 * GET /api/reports?type=SEVERITY|STATUS
 *   Any authenticated role.
 *   Returns ReportResponseDto: { type, slices: [{ label, count }] }
 *   - SEVERITY groups by Severity enum value (CLEAR/WARNING/MAJOR/SEVERE/CRITICAL)
 *   - STATUS groups by AlarmStatus enum value (UNACKNOWLEDGED/ACKNOWLEDGED/CLEARED/TERMINATED)
 */
import apiClient from './apiClient';
import { ApiResponse } from '../types/domain';

export type ReportType = 'SEVERITY' | 'STATUS';

export interface ReportSlice {
  /** Enum name: Severity or AlarmStatus value */
  label: string;
  count: number;
}

export interface ReportData {
  type: ReportType;
  slices: ReportSlice[];
}

export const reportApi = {
  /**
   * GET /api/reports?type=SEVERITY
   * GET /api/reports?type=STATUS
   */
  getReport: (type: ReportType) =>
    apiClient.get<ApiResponse<ReportData>>('/api/reports', { params: { type } }),
};
