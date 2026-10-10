"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n";
import { MarginSpreadChart } from "./Charts";

interface MarginRow {
  year: number;
  corridor: string;
  export_price_cad_mwh: number;
  export_price_usd_mwh: number;
  us_market_price_usd_mwh: number;
  margin_usd_mwh: number;
  export_volume_mwh: number;
  margin_value_usd_millions: number;
}

function fmt(n: number, lang: string, digits = 2) {
  return n.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export default function Explorer() {
  const { t, lang } = useLang();
  const [rows, setRows] = useState<MarginRow[]>([]);
  const [corridor, setCorridor] = useState("all");
  const [year, setYear] = useState("all");

  useEffect(() => {
    const p = new URLSearchParams();
    if (corridor !== "all") p.set("corridor", corridor);
    if (year !== "all") p.set("year", year);
    fetch(`/api/v1/margins?${p.toString()}`)
      .then((r) => r.json())
      .then((d) => setRows(d.rows ?? []));
  }, [corridor, year]);

  const corridors = Array.from(new Set(rows.map((r) => r.corridor))).sort();
  const years = Array.from(new Set(rows.map((r) => r.year))).sort((a, b) => b - a);
  const shown = rows
    .filter((r) => (corridor === "all" ? true : r.corridor === corridor))
    .filter((r) => (year === "all" ? true : r.year === Number(year)))
    .sort((a, b) => b.year - a.year || b.margin_usd_mwh - a.margin_usd_mwh);

  const chartCorridor = corridor === "all" ? null : corridor;

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <select
          value={corridor}
          onChange={(e) => setCorridor(e.target.value)}
          className="rounded-full border border-line bg-paper px-5 py-2.5 text-[15px] font-medium"
          aria-label={t.explorer.cols.corridor}
        >
          <option value="all">{t.explorer.corridorFilter}</option>
          {corridors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded-full border border-line bg-paper px-5 py-2.5 text-[15px] font-medium"
          aria-label={t.explorer.cols.year}
        >
          <option value="all">{t.explorer.yearFilter}</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {chartCorridor ? (
        <div className="mt-10 rounded-[24px] border border-line bg-paper p-6 md:p-8">
          <h3 className="display text-[24px] md:text-[28px]">{t.explorer.chartTitle}</h3>
          <p className="mt-1 text-[14px] text-ink/60">
            {chartCorridor} · {t.explorer.chartSub}
          </p>
          <div className="mt-6">
            <MarginSpreadChart rows={shown} corridor={chartCorridor} />
          </div>
        </div>
      ) : (
        <p className="mt-6 text-[15px] text-ink/60">{t.explorer.pickCorridor}</p>
      )}

      <p className="mt-10 text-[14px] text-ink/55">
        {t.explorer.showing} {shown.length} {t.explorer.of} {rows.length}
      </p>
      <div className="mt-3 overflow-x-auto rounded-[24px] border border-line">
        <table className="w-full min-w-[900px] border-collapse bg-paper text-left text-[14px]">
          <thead>
            <tr className="border-b border-line bg-paper-warm text-[12px] uppercase tracking-[0.08em] text-ink/55">
              <th className="px-4 py-3 font-semibold">{t.explorer.cols.year}</th>
              <th className="px-4 py-3 font-semibold">{t.explorer.cols.corridor}</th>
              <th className="px-4 py-3 font-semibold">{t.explorer.cols.exportUsd}</th>
              <th className="px-4 py-3 font-semibold">{t.explorer.cols.usPrice}</th>
              <th className="px-4 py-3 font-semibold">{t.explorer.cols.margin}</th>
              <th className="px-4 py-3 font-semibold">{t.explorer.cols.volume}</th>
              <th className="px-4 py-3 font-semibold">{t.explorer.cols.marginValue}</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={`${r.corridor}-${r.year}`} className="border-b border-line/60 last:border-0 hover:bg-paper-warm">
                <td className="px-4 py-2.5 font-medium">{r.year}</td>
                <td className="px-4 py-2.5">{r.corridor}</td>
                <td className="px-4 py-2.5 font-mono">${fmt(r.export_price_usd_mwh, lang)}</td>
                <td className="px-4 py-2.5 font-mono">${fmt(r.us_market_price_usd_mwh, lang)}</td>
                <td className="px-4 py-2.5 font-mono font-semibold text-canada">${fmt(r.margin_usd_mwh, lang)}</td>
                <td className="px-4 py-2.5 font-mono">{fmt(r.export_volume_mwh / 1e6, lang, 2)}</td>
                <td className="px-4 py-2.5 font-mono">{fmt(r.margin_value_usd_millions, lang, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {shown.length === 0 && <p className="mt-6 text-[15px] text-ink/60">{t.explorer.noResult}</p>}
    </div>
  );
}
