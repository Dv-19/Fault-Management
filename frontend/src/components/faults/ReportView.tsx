/**
 * Report view — calls GET /api/reports?type=SEVERITY|STATUS
 * Available to all authenticated roles (ADMIN, OPERATOR, MANAGER).
 *
 * Backend: ReportResponseDto { type, slices: [{ label, count }] }
 */
import React, { useCallback, useEffect, useState } from 'react';
import { reportApi, ReportType, ReportData } from '../../api/reportApi';
import { isApiError } from '../../context/AuthContext';
import ReportChart from './ReportChart';
import ErrorBanner from '../common/ErrorBanner';
import LoadingSpinner from '../common/LoadingSpinner';

const TYPE_OPTIONS: { value: ReportType; label: string; description: string }[] = [
  {
    value: 'SEVERITY',
    label: 'By Severity',
    description: 'Distribution of alarms across severity levels',
  },
  {
    value: 'STATUS',
    label: 'By Status',
    description: 'Breakdown of alarms by their current lifecycle state',
  },
];

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function ReportView() {
  const [reportType, setReportType] = useState<ReportType>('SEVERITY');
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchReport = useCallback(
    (type: ReportType) => {
      setLoading(true);
      setError(null);
      reportApi
        .getReport(type)
        .then((res) => {
          setData(res.data.data);
          setLastUpdated(new Date());
        })
        .catch((err) => {
          setError(isApiError(err) ? err.message : 'Unable to load report.');
        })
        .finally(() => setLoading(false));
    },
    [],
  );

  useEffect(() => {
    fetchReport(reportType);
  }, [reportType, fetchReport]);

  const activeOption = TYPE_OPTIONS.find((o) => o.value === reportType)!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      {/* Type selector */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={reportType === opt.value ? 'btn btn-primary' : 'btn btn-ghost'}
              onClick={() => setReportType(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Refresh button */}
        <button
          type="button"
          className="btn btn-ghost"
          disabled={loading}
          onClick={() => fetchReport(reportType)}
          title="Refresh report data"
          style={{ marginLeft: 'auto' }}
        >
          {loading ? '…' : '↻ Refresh'}
        </button>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      {loading && !data ? (
        <LoadingSpinner label="Building report…" />
      ) : data ? (
        <div className="card">
          {/* Card header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-1)',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem' }}>
                Fault Analysis — {activeOption.label}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                {activeOption.description}
              </p>
            </div>
            {lastUpdated && (
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--color-text-muted)',
                  alignSelf: 'flex-end',
                  whiteSpace: 'nowrap',
                }}
              >
                Last updated: {formatTime(lastUpdated)}
              </span>
            )}
          </div>

          <ReportChart type={data.type} slices={data.slices} />
        </div>
      ) : null}
    </div>
  );
}
