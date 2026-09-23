import React from 'react';
import { FaultReportSummaryItem } from '../../types/domain';
import { severityStyle } from '../../config/severityStyle';
import './reportChart.css';

interface ReportChartProps {
  data: FaultReportSummaryItem[];
  /** When true, bars use the SRS severity color mapping; otherwise a neutral accent. */
  colorBySeverity: boolean;
}

/**
 * US07: "Based on the input the charts should be generated... A graphical
 * representation of the severity from all the faults should be displayed
 * with proper mappings." Built as plain inline SVG bars rather than pulling
 * in a charting library, so no new dependency is needed in the project.
 */
export default function ReportChart({ data, colorBySeverity }: ReportChartProps) {
  if (data.length === 0) {
    return <div className="empty-state">No fault data to chart yet.</div>;
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="report-chart card">
      {data.map((item) => {
        const style = colorBySeverity ? severityStyle(item.category) : null;
        const barColor = style?.color ?? 'var(--color-accent)';
        const label = style?.label ?? item.category;
        const widthPct = Math.max((item.count / maxCount) * 100, 2);

        return (
          <div className="report-chart-row" key={item.category}>
            <span className="report-chart-label">{label}</span>
            <div className="report-chart-track">
              <div
                className="report-chart-bar"
                style={{ width: `${widthPct}%`, backgroundColor: barColor }}
                role="img"
                aria-label={`${label}: ${item.count}`}
              />
            </div>
            <span className="report-chart-count">{item.count}</span>
          </div>
        );
      })}
    </div>
  );
}
