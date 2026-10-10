"use client";

import { useLang } from "@/i18n";

const RED = "#d80621";
const INK = "#0a0f1e";
const GRID = "rgba(10,15,30,0.10)";
const TICK = "rgba(10,15,30,0.45)";

function fmtUsd(n: number, lang: string) {
  return "$" + n.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA", { maximumFractionDigits: 0 });
}

type Pt = { year: number; a: number; b: number };

function LineChart({
  points,
  labelA,
  labelB,
  shade,
  unit,
  zeroLine,
}: {
  points: Pt[];
  labelA: string;
  labelB: string;
  shade: boolean;
  unit: string;
  zeroLine?: boolean;
}) {
  const { lang } = useLang();
  if (points.length < 2) return null;
  const W = 760;
  const H = 340;
  const PL = 56;
  const PR = 16;
  const PT = 18;
  const PB = 36;
  const years = points.map((p) => p.year);
  const vals = points.flatMap((p) => [p.a, p.b]);
  let lo = Math.min(...vals);
  let hi = Math.max(...vals);
  if (zeroLine) {
    lo = Math.min(lo, 0);
    hi = Math.max(hi, 0);
  }
  const pad = (hi - lo) * 0.08;
  lo -= pad;
  hi += pad;
  const x = (yr: number) => PL + ((yr - years[0]) / (years[years.length - 1] - years[0])) * (W - PL - PR);
  const y = (v: number) => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB);
  const line = (key: "a" | "b") =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.year).toFixed(1)},${y(p[key]).toFixed(1)}`).join(" ");
  const area = `${line("a")} L${x(years[years.length - 1]).toFixed(1)},${y(
    points[points.length - 1].b
  ).toFixed(1)} ${points
    .slice()
    .reverse()
    .map((p) => `L${x(p.year).toFixed(1)},${y(p.b).toFixed(1)}`)
    .join(" ")} Z`;
  const ticks = 5;
  const tickVals = Array.from({ length: ticks }, (_, i) => lo + ((hi - lo) / (ticks - 1)) * i);
  const yearTicks = years.filter((_, i) => i % Math.ceil(years.length / 8) === 0);
  return (
    <div className="w-full overflow-x-clip">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
        {tickVals.map((v, i) => (
          <g key={i}>
            <line x1={PL} x2={W - PR} y1={y(v)} y2={y(v)} stroke={GRID} strokeWidth={1} />
            <text x={PL - 8} y={y(v) + 4} textAnchor="end" fontSize={11} fill={TICK}>
              {fmtUsd(v, lang)}
            </text>
          </g>
        ))}
        {yearTicks.map((yr) => (
          <text key={yr} x={x(yr)} y={H - 12} textAnchor="middle" fontSize={11} fill={TICK}>
            {yr}
          </text>
        ))}
        {zeroLine && (
          <line x1={PL} x2={W - PR} y1={y(0)} y2={y(0)} stroke={INK} strokeWidth={1.5} strokeDasharray="5 4" opacity={0.6} />
        )}
        {shade && <path d={area} fill={RED} opacity={0.14} />}
        <path d={line("b")} fill="none" stroke={INK} strokeWidth={2.5} />
        <path d={line("a")} fill="none" stroke={RED} strokeWidth={2.5} />
        {points.map((p) => (
          <circle key={p.year} cx={x(p.year)} cy={y(p.a)} r={3} fill={RED} />
        ))}
        <text x={PL} y={12} fontSize={12} fill={TICK}>
          {unit}
        </text>
      </svg>
      <div className="mt-2 flex flex-wrap gap-5 px-1">
        <span className="flex items-center gap-2 text-[13px] text-ink/70">
          <span className="inline-block h-[3px] w-6 rounded bg-canada" />
          {labelA}
        </span>
        <span className="flex items-center gap-2 text-[13px] text-ink/70">
          <span className="inline-block h-[3px] w-6 rounded bg-ink" />
          {labelB}
        </span>
      </div>
    </div>
  );
}

export function MarginSpreadChart({
  rows,
  corridor,
}: {
  rows: { year: number; corridor: string; export_price_usd_mwh: number; us_market_price_usd_mwh: number }[];
  corridor: string;
}) {
  const { t, lang } = useLang();
  const points = rows
    .filter((r) => r.corridor === corridor)
    .sort((a, b) => a.year - b.year)
    .map((r) => ({ year: r.year, a: r.export_price_usd_mwh, b: r.us_market_price_usd_mwh }));
  if (points.length === 0) return null;
  return (
    <LineChart
      points={points}
      labelA={t.explorer.legendExport}
      labelB={t.explorer.legendUs}
      shade
      unit={lang === "fr" ? "$US par MWh" : "USD per MWh"}
    />
  );
}

export function InversionChart({
  rows,
}: {
  rows: { year: number; west_usd_mwh: number | null; east_usd_mwh: number | null }[];
}) {
  const { lang } = useLang();
  const points = rows
    .filter((r) => r.west_usd_mwh !== null && r.east_usd_mwh !== null && r.year <= 2025)
    .map((r) => ({ year: r.year, a: r.west_usd_mwh as number, b: r.east_usd_mwh as number }));
  return (
    <LineChart
      points={points}
      labelA={lang === "fr" ? "Exportations de l'Ouest" : "Western exports"}
      labelB={lang === "fr" ? "Exportations de l'Est" : "Eastern exports"}
      shade={false}
      unit={lang === "fr" ? "$US par MWh" : "USD per MWh"}
    />
  );
}

export function InversionGapChart({
  rows,
}: {
  rows: { year: number; west_minus_east_usd: number | null }[];
}) {
  const { lang } = useLang();
  const pts = rows.filter((r) => r.west_minus_east_usd !== null && r.year <= 2025);
  if (pts.length === 0) return null;
  const W = 760;
  const H = 260;
  const PL = 56;
  const PR = 16;
  const PT = 18;
  const PB = 36;
  const vals = pts.map((p) => p.west_minus_east_usd as number);
  const hi = Math.max(...vals) * 1.08;
  const lo = Math.min(...vals) * 1.08;
  const x = (yr: number) => PL + ((yr - pts[0].year) / (pts[pts.length - 1].year - pts[0].year)) * (W - PL - PR);
  const y = (v: number) => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB);
  const bw = Math.max(2, ((W - PL - PR) / pts.length) * 0.62);
  const yearTicks = pts.map((p) => p.year).filter((_, i) => i % 5 === 0);
  return (
    <div className="w-full overflow-x-clip">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
        <line x1={PL} x2={W - PR} y1={y(0)} y2={y(0)} stroke={INK} strokeWidth={1.5} />
        {pts.map((p) => {
          const v = p.west_minus_east_usd as number;
          const top = v >= 0 ? y(v) : y(0);
          const hgt = Math.abs(y(v) - y(0));
          return (
            <rect
              key={p.year}
              x={x(p.year) - bw / 2}
              y={top}
              width={bw}
              height={Math.max(hgt, 1)}
              fill={v >= 0 ? RED : INK}
              opacity={v >= 0 ? 0.85 : 0.55}
              rx={1}
            />
          );
        })}
        {yearTicks.map((yr) => (
          <text key={yr} x={x(yr)} y={H - 12} textAnchor="middle" fontSize={11} fill={TICK}>
            {yr}
          </text>
        ))}
        <text x={PL} y={12} fontSize={12} fill={TICK}>
          {lang === "fr" ? "Ouest moins Est, $US par MWh" : "West minus East, USD per MWh"}
        </text>
        <text x={PL + 4} y={y(Math.max(...vals)) - 6} fontSize={11} fill={RED} fontWeight={600}>
          {lang === "fr" ? "L'Ouest plus cher" : "West costs more"}
        </text>
        <text x={PL + 4} y={y(Math.min(...vals)) + 14} fontSize={11} fill={TICK}>
          {lang === "fr" ? "L'Est plus cher" : "East costs more"}
        </text>
      </svg>
    </div>
  );
}

export function RankedBars({
  rows,
  valueKey,
  valueLabel,
}: {
  rows: { corridor: string; [k: string]: unknown }[];
  valueKey: string;
  valueLabel: string;
}) {
  const { lang } = useLang();
  const sorted = [...rows].sort((a, b) => Number(b[valueKey]) - Number(a[valueKey]));
  if (sorted.length === 0) return null;
  const max = Math.max(...sorted.map((r) => Number(r[valueKey])));
  const W = 760;
  const rowH = 52;
  const PL = 200;
  const PR = 110;
  const H = sorted.length * rowH + 30;
  const x = (v: number) => PL + (v / max) * (W - PL - PR);
  return (
    <div className="w-full overflow-x-clip">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
        {sorted.map((r, i) => {
          const v = Number(r[valueKey]);
          return (
            <g key={String(r.corridor)}>
              <text x={PL - 10} y={i * rowH + 28} textAnchor="end" fontSize={13} fill={INK} fontWeight={500}>
                {String(r.corridor)}
              </text>
              <rect x={PL} y={i * rowH + 10} width={Math.max(x(v) - PL, 2)} height={22} rx={11} fill={i === 0 ? RED : INK} opacity={i === 0 ? 1 : 0.72} />
              <text x={x(v) + 8} y={i * rowH + 27} fontSize={13} fill={i === 0 ? RED : TICK} fontWeight={i === 0 ? 700 : 500}>
                {valueLabel === "usd" ? fmtUsd(v, lang) : v.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA", { maximumFractionDigits: 1 })}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
