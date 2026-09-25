/**
 * Interactive donut pie chart — pure SVG, no charting library.
 *
 * Interactions:
 *  - Hover  → slice pops out, centre updates, legend row highlights
 *  - Click  → isolates that slice (dims all others), locks the tooltip
 *  - Click again / click centre / press Esc → deselects
 *  - Summary cards → hover/click in sync with slices
 *  - Floating tooltip follows the mouse cursor
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ReportSlice, ReportType } from '../../api/reportApi';
import { severityStyle } from '../../config/severityStyle';
import './reportChart.css';

interface ReportChartProps {
  type: ReportType;
  slices: ReportSlice[];
}

const STATUS_COLORS: Record<string, { color: string; background: string }> = {
  UNACKNOWLEDGED: { color: '#b3261e', background: '#fbe4e2' },
  ACKNOWLEDGED:   { color: '#b56a00', background: '#fbedd0' },
  CLEARED:        { color: '#1f7a4d', background: '#e2f3ea' },
  TERMINATED:     { color: '#6b7280', background: '#eceff2' },
};

function getColor(type: ReportType, label: string) {
  if (type === 'SEVERITY') return severityStyle(label);
  return STATUS_COLORS[label] ?? { color: '#6b7280', background: '#eceff2' };
}

function humanLabel(label: string) {
  return label.charAt(0) + label.slice(1).toLowerCase().replace(/_/g, ' ');
}

// ── SVG math ────────────────────────────────────────────────────────────────

interface Sector {
  slice: ReportSlice;
  color: string;
  background: string;
  startAngle: number;
  endAngle: number;
}

const CX = 160;
const CY = 160;
const R  = 118;
const IR = 66;

function buildSectors(type: ReportType, slices: ReportSlice[]): Sector[] {
  const total = slices.reduce((s, r) => s + r.count, 0);
  if (total === 0) return [];
  const out: Sector[] = [];
  let angle = -Math.PI / 2;
  for (const slice of slices) {
    const sweep = (slice.count / total) * 2 * Math.PI;
    const { color, background } = getColor(type, slice.label);
    out.push({ slice, color, background, startAngle: angle, endAngle: angle + sweep });
    angle += sweep;
  }
  return out;
}

function polar(r: number, a: number) {
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

function sectorPath(r: number, inner: number, start: number, end: number) {
  const large = end - start > Math.PI ? 1 : 0;
  const o1 = polar(r, start);
  const o2 = polar(r, end);
  const i1 = polar(inner, end);
  const i2 = polar(inner, start);
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${r} ${r} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${inner} ${inner} 0 ${large} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ');
}

// ── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipState {
  label: string;
  count: number;
  pct: number;
  color: string;
  background: string;
  x: number;
  y: number;
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ReportChart({ type, slices }: ReportChartProps) {
  const [hovered, setHovered]   = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [tooltip, setTooltip]   = useState<TooltipState | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const total = slices.reduce((s, r) => s + r.count, 0);
  const sectors = buildSectors(type, slices);

  // Esc to deselect
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSliceEnter = useCallback(
    (sec: Sector, e: React.MouseEvent) => {
      if (selected) return; // tooltip locked while selected
      setHovered(sec.slice.label);
      const pct = total > 0 ? Math.round((sec.slice.count / total) * 100) : 0;
      const rect = wrapRef.current?.getBoundingClientRect();
      setTooltip({
        label: sec.slice.label,
        count: sec.slice.count,
        pct,
        color: sec.color,
        background: sec.background,
        x: e.clientX - (rect?.left ?? 0) + 14,
        y: e.clientY - (rect?.top ?? 0) - 12,
      });
    },
    [selected, total],
  );

  const handleSliceMove = useCallback(
    (e: React.MouseEvent) => {
      if (selected || !tooltip) return;
      const rect = wrapRef.current?.getBoundingClientRect();
      setTooltip((t) =>
        t ? { ...t, x: e.clientX - (rect?.left ?? 0) + 14, y: e.clientY - (rect?.top ?? 0) - 12 } : t,
      );
    },
    [selected, tooltip],
  );

  const handleSliceLeave = useCallback(() => {
    if (selected) return;
    setHovered(null);
    setTooltip(null);
  }, [selected]);

  const handleSliceClick = useCallback(
    (sec: Sector, e: React.MouseEvent) => {
      e.stopPropagation();
      if (selected === sec.slice.label) {
        // deselect
        setSelected(null);
        setHovered(null);
        setTooltip(null);
      } else {
        setSelected(sec.slice.label);
        setHovered(sec.slice.label);
        const pct = total > 0 ? Math.round((sec.slice.count / total) * 100) : 0;
        const rect = wrapRef.current?.getBoundingClientRect();
        setTooltip({
          label: sec.slice.label,
          count: sec.slice.count,
          pct,
          color: sec.color,
          background: sec.background,
          x: e.clientX - (rect?.left ?? 0) + 14,
          y: e.clientY - (rect?.top ?? 0) - 12,
        });
      }
    },
    [selected, total],
  );

  // Click outside pie/legend area → deselect
  const handleWrapClick = () => {
    setSelected(null);
    setHovered(null);
    setTooltip(null);
  };

  const activeLabel = selected ?? hovered;
  const activeSector = sectors.find((s) => s.slice.label === activeLabel);

  if (slices.length === 0) {
    return <div className="empty-state">No alarm data to chart yet.</div>;
  }

  return (
    <div
      ref={wrapRef}
      className="report-pie-wrap"
      onClick={handleWrapClick}
      style={{ position: 'relative', userSelect: 'none' }}
    >
      {/* ── Summary cards ── */}
      <div className="report-summary-grid">
        {slices.map((s) => {
          const { color, background } = getColor(type, s.label);
          const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
          const isActive = activeLabel === s.label;
          const isDimmed = !!selected && selected !== s.label;
          return (
            <div
              key={s.label}
              className="report-summary-card"
              style={{
                borderTop: `3px solid ${color}`,
                background,
                opacity: isDimmed ? 0.35 : 1,
                outline: isActive ? `2px solid ${color}` : undefined,
                transition: 'opacity 200ms, transform 150ms, box-shadow 150ms',
              }}
              onMouseEnter={() => { if (!selected) setHovered(s.label); }}
              onMouseLeave={() => { if (!selected) setHovered(null); }}
              onClick={(e) => {
                e.stopPropagation();
                setSelected((prev) => (prev === s.label ? null : s.label));
                setHovered(s.label);
              }}
            >
              <span className="report-summary-label" style={{ color }}>{humanLabel(s.label)}</span>
              <span className="report-summary-count" style={{ color }}>{s.count}</span>
              <span className="report-summary-pct">{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* hint text */}
      {selected ? (
        <p className="report-hint">
          Showing <strong style={{ color: activeSector?.color }}>{humanLabel(selected)}</strong>
          {' '}— click again or press <kbd>Esc</kbd> to clear
        </p>
      ) : (
        <p className="report-hint">Click a slice or card to isolate it</p>
      )}

      {/* ── Pie + legend ── */}
      <div className="report-chart-row" onClick={(e) => e.stopPropagation()}>

        {/* SVG donut */}
        <svg
          viewBox="0 0 320 320"
          width="300"
          height="300"
          className="report-pie-svg"
          aria-label="Alarm distribution pie chart"
          onMouseMove={handleSliceMove}
        >
          {sectors.map((sec) => {
            const isActive = activeLabel === sec.slice.label;
            const isDimmed = !!selected && selected !== sec.slice.label;
            const mid = (sec.startAngle + sec.endAngle) / 2;
            const popDist = isActive ? 10 : 0;
            const tx = Math.cos(mid) * popDist;
            const ty = Math.sin(mid) * popDist;

            return (
              <path
                key={sec.slice.label}
                d={sectorPath(R, IR, sec.startAngle, sec.endAngle)}
                fill={sec.color}
                stroke="#fff"
                strokeWidth={isActive ? 3 : 2}
                style={{
                  transform: `translate(${tx}px, ${ty}px)`,
                  transition: 'transform 200ms ease, opacity 200ms ease, filter 200ms ease',
                  opacity: isDimmed ? 0.25 : 1,
                  cursor: 'pointer',
                  filter: isActive ? `drop-shadow(0 4px 10px ${sec.color}88)` : 'none',
                }}
                onMouseEnter={(e) => handleSliceEnter(sec, e)}
                onMouseLeave={handleSliceLeave}
                onClick={(e) => handleSliceClick(sec, e)}
                aria-label={`${humanLabel(sec.slice.label)}: ${sec.slice.count}`}
              />
            );
          })}

          {/* Centre — click to deselect */}
          <circle
            cx={CX} cy={CY} r={IR - 2}
            fill="white"
            style={{ cursor: selected ? 'pointer' : 'default' }}
            onClick={(e) => { e.stopPropagation(); setSelected(null); setHovered(null); setTooltip(null); }}
          />
          <text
            x={CX} y={CY - 14}
            textAnchor="middle"
            fontSize="30"
            fontWeight="800"
            fill={activeSector ? activeSector.color : '#1e293b'}
            style={{ transition: 'fill 150ms', pointerEvents: 'none' }}
          >
            {activeSector ? activeSector.slice.count : total}
          </text>
          <text
            x={CX} y={CY + 12}
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="700"
            letterSpacing="0.08em"
            fill="#94a3b8"
            style={{ pointerEvents: 'none' }}
          >
            {activeSector ? humanLabel(activeSector.slice.label).toUpperCase() : 'TOTAL'}
          </text>
          {selected && (
            <text
              x={CX} y={CY + 28}
              textAnchor="middle"
              fontSize="9"
              fill="#cbd5e1"
              style={{ pointerEvents: 'none' }}
            >
              click to clear
            </text>
          )}
        </svg>

        {/* Legend */}
        <div className="report-legend">
          {sectors.map((sec) => {
            const pct = total > 0 ? Math.round((sec.slice.count / total) * 100) : 0;
            const isActive = activeLabel === sec.slice.label;
            const isDimmed = !!selected && selected !== sec.slice.label;
            return (
              <div
                key={sec.slice.label}
                className="report-legend-item"
                style={{
                  opacity: isDimmed ? 0.3 : 1,
                  background: isActive ? `${sec.background}` : undefined,
                  outline: isActive ? `1.5px solid ${sec.color}44` : undefined,
                  transition: 'opacity 200ms, background 150ms',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => { if (!selected) setHovered(sec.slice.label); }}
                onMouseLeave={() => { if (!selected) setHovered(null); }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected((prev) => (prev === sec.slice.label ? null : sec.slice.label));
                  setHovered(sec.slice.label);
                }}
              >
                <span className="report-legend-dot" style={{ background: sec.color }} />
                <span className="report-legend-name">{humanLabel(sec.slice.label)}</span>
                <span className="report-legend-count" style={{ color: sec.color }}>{sec.slice.count}</span>
                <div className="report-legend-bar-track">
                  <div
                    className="report-legend-bar-fill"
                    style={{ width: `${pct}%`, background: sec.color }}
                  />
                </div>
                <span className="report-legend-pct">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Floating tooltip ── */}
      {tooltip && (
        <div
          className="report-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            borderColor: tooltip.color,
            pointerEvents: 'none',
          }}
        >
          <div className="report-tooltip-header" style={{ color: tooltip.color }}>
            <span className="report-tooltip-dot" style={{ background: tooltip.color }} />
            {humanLabel(tooltip.label)}
            {selected === tooltip.label && <span className="report-tooltip-pin">📌</span>}
          </div>
          <div className="report-tooltip-body" style={{ background: tooltip.background }}>
            <span className="report-tooltip-count" style={{ color: tooltip.color }}>
              {tooltip.count}
            </span>
            <span className="report-tooltip-pct">{tooltip.pct}% of total</span>
          </div>
        </div>
      )}
    </div>
  );
}
