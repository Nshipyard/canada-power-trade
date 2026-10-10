"use client";

import { useLang } from "@/i18n";
import McpConnect from "./McpConnect";

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/margins?corridor=East%20to%20ISO-NE&year=2025",
    descEn: "Margin rows by corridor and year: export price, US market price, margin, volume",
    descFr: "Marges par corridor et année : prix d'exportation, prix du marché américain, marge, volume",
    response: `{
  "total": 1,
  "rows": [
    {
      "year": 2025,
      "corridor": "East to ISO-NE",
      "export_price_usd_mwh": 53.24,
      "us_market_price_usd_mwh": 155.85,
      "margin_usd_mwh": 102.6,
      "export_volume_mwh": 14234567.8,
      "margin_value_usd_millions": 1460.5
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/inversion",
    descEn: "West versus East export prices, 1990-2026, the inversion series",
    descFr: "Prix d'exportation Ouest contre Est, 1990-2026, la série d'inversion",
    response: `{
  "total": 37,
  "rows": [
    { "year": 2023, "west_usd_mwh": 97.94, "east_usd_mwh": 46.39, "west_minus_east_usd": 51.54 }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/corridors",
    descEn: "The six export corridors with origin provinces, market states, and grid operators",
    descFr: "Les six corridors d'exportation avec provinces d'origine, États de marché et exploitants",
    response: `{
  "total": 6,
  "rows": [
    { "corridor": "East to ISO-NE", "origin_provinces_en": "Ontario, Quebec, New Brunswick", "iso": "ISO New England" }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/crosswalk",
    descEn: "The hand-curated destination-to-market-region crosswalk",
    descFr: "La table de correspondance destination vers région de marché, constituée à la main",
    response: `{
  "total": 55,
  "rows": [
    { "destination_in_cer_data": "Maine", "market_region": "ISO-NE", "iso_rto": "ISO New England" }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/summary",
    descEn: "Headline aggregates: cumulative margin, 2025 ranking, inversion crossover and peak",
    descFr: "Agrégats principaux : marge cumulative, classement 2025, bascule et pic d'inversion",
    response: `{
  "cumulative_margin_usd_billions": 59.6,
  "top_corridor_2025": { "corridor": "East to ISO-NE", "margin_usd_mwh": 102.6 },
  "inversion_peak": { "year": 2023, "west_minus_east_usd": 51.54 }
}`,
  },
];

export default function Developers() {
  const { t, lang } = useLang();
  return (
    <section id="developers" className="bg-ink text-white">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">{t.developers.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.developers.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-white/70">{t.developers.body}</p>

        <h3 className="mt-12 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">{t.developers.endpoints}</h3>
        <div className="mt-5 flex flex-col gap-4">
          {endpoints.map((e) => (
            <div key={e.path} className="overflow-hidden rounded-[24px] bg-white/[0.06]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-canada px-3 py-1 text-[12px] font-bold text-white">{e.method}</span>
                  <code className="font-mono text-[13.5px] text-white/90 break-all">{e.path}</code>
                </div>
                <a
                  href={e.path}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-full bg-white px-4 py-2 text-[14px] font-semibold text-ink hover:opacity-90"
                >
                  {t.developers.tryIt}
                </a>
              </div>
              <div className="px-6 py-4">
                <p className="text-[14px] text-white/60">{lang === "fr" ? e.descFr : e.descEn}</p>
                <pre className="mt-3 overflow-x-auto whitespace-pre font-mono text-[12.5px] leading-relaxed text-white/80">{e.response}</pre>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <a href="/api/openapi.json" target="_blank" rel="noreferrer" className="text-[15px] font-semibold text-white underline underline-offset-4 hover:opacity-80">
            {t.developers.openapi} →
          </a>
        </div>

        <McpConnect
          config={{
            slug: "canada-power-trade",
            displayName: "The Power Trade Margin Board",
            exampleEn: "what was the margin on the East to ISO-NE corridor in 2025",
            exampleFr: "quelle était la marge du corridor Est vers ISO-NE en 2025",
          }}
        />
      </div>
    </section>
  );
}
