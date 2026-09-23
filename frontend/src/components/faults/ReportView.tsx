import React, { useEffect, useState } from 'react';
import { faultApi } from '../../api/faultApi';
import { FaultReportSummaryItem } from '../../types/domain';
import { isApiError } from '../../context/AuthContext';
import ErrorBanner from '../common/ErrorBanner';
import LoadingSpinner from '../common/LoadingSpinner';
import ReportChart from './ReportChart';

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'severity', label: 'Severity' },
  { value: 'status', label: 'Status' },
];

export default function ReportView() {
  const [category, setCategory] = useState('severity');
  const [data, setData] = useState<FaultReportSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    faultApi
      .reportSummary(category)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(isApiError(err) ? err.message : 'Unable to load report.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <div>
      <div className="page-header">
        <h1>Report</h1>
      </div>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      <div className="toolbar">
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="report-category">Report category</label>
          <select id="report-category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Building report…" /> : <ReportChart data={data} colorBySeverity={category === 'severity'} />}
    </div>
  );
}
