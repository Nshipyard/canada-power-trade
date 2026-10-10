"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n";
import { RankedBars, InversionGapChart, MarginSpreadChart } from "./Charts";

interface MarginRow {
  year: number;
  corridor: string;
  export_price_usd_mwh: number;
  us_market_price_usd_mwh: number;
  margin_usd_mwh: number;
  margin_value_usd_millions: number;
  export_volume_mwh: number;
}

interface InversionRow {
  year: number;
  west_usd_mwh: number | null;
  east_usd_mwh: number | null;
  west_minus_east_usd: number | null;
}

function CiteButton({ text }: { text: string }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      onClick={copy}
      className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-ink/70 hover:border-ink hover:text-ink"
    >
      {copied ? t.showcase.copied : t.showcase.citeThis}
    </button>
  );
}

function Card({ q, a, cite, children }: { q: string; a: string; cite: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[32px] border border-line bg-paper p-7 md:p-10">
      <h3 className="display max-w-[720px] text-[26px] leading-tight md:text-[32px]">{q}</h3>
      <p className="mt-4 max-w-[760px] text-[16px] leading-relaxed text-ink/75">{a}</p>
      <div className="mt-7">{children}</div>
      <div className="mt-6">
        <CiteButton text={cite} />
      </div>
    </article>
  );
}

export default function Showcase() {
  const { t, lang } = useLang();
  const [margins, setMargins] = useState<MarginRow[]>([]);
  const [inversion, setInversion] = useState<InversionRow[]>([]);

  useEffect(() => {
    fetch("/api/v1/margins")
      .then((r) => r.json())
      .then((d) => setMargins(d.rows ?? []));
    fetch("/api/v1/inversion")
      .then((r) => r.json())
      .then((d) => setInversion(d.rows ?? []));
  }, []);

  const rows2025 = margins.filter((m) => m.year === 2025);
  const site = lang === "fr" ? "le tableau des marges du commerce de l'électricité" : "The Power Trade Margin Board";
  const cite = (fact: string) =>
    `${fact} Source: ${site}, Open Nshipyard (données : CER, EIA, Banque du Canada; calculé à partir de données ouvertes, récupéré le 2026-10-10).`;

  return (
    <section id="showcase" className="bg-paper">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{t.showcase.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.showcase.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-ink/70">{t.showcase.body}</p>

        <div className="mt-12 flex flex-col gap-6">
          <Card
            q={t.showcase.q1}
            a={t.showcase.a1}
            cite={cite("East to New England captured $20.44B of margin on 260.1 TWh of exports, 2010-2025; 2025 margin $102.60/MWh.")}
          >
            <RankedBars rows={rows2025} valueKey="margin_usd_mwh" valueLabel="usd" />
          </Card>

          <Card
            q={t.showcase.q2}
            a={t.showcase.a2}
            cite={cite("Western export prices have exceeded eastern prices every year since 2018, peaking at +$51.54/MWh in 2023; for most of 1990-2016 the East was more expensive.")}
          >
            <InversionGapChart rows={inversion} />
          </Card>

          <Card
            q={t.showcase.q3}
            a={t.showcase.a3}
            cite={cite("In 2001 the California crisis sent western export prices to $110.78/MWh against $41.05/MWh in the East, the widest gap in the 36-year series.")}
          >
            <MarginSpreadChart rows={margins} corridor="West to US West" />
          </Card>

          <Card
            q={t.showcase.q4}
            a={t.showcase.a4}
            cite={cite("In 2025 New England retail averaged $155.85/MWh while Canada received $53.24/MWh for the power it exported there.")}
          >
            <MarginSpreadChart rows={margins} corridor="East to ISO-NE" />
          </Card>
        </div>

        <p className="mt-8 max-w-[860px] text-[13px] leading-relaxed text-ink/50">{t.showcase.retrievedNote}</p>
      </div>
    </section>
  );
}
