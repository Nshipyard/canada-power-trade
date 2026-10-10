"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n";

interface XRow {
  destination_in_cer_data: string;
  market_region: string;
  us_states_in_basket: string;
  iso_rto: string;
}

export default function Methodology() {
  const { t } = useLang();
  const [rows, setRows] = useState<XRow[]>([]);

  useEffect(() => {
    fetch("/api/v1/crosswalk")
      .then((r) => r.json())
      .then((d) => setRows(d.rows ?? []));
  }, []);

  return (
    <section id="methodology" className="bg-paper-warm">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{t.methodology.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.methodology.title}</h2>
        <ol className="mt-10 flex max-w-[860px] flex-col gap-6">
          {t.methodology.items.map((item, i) => (
            <li key={i} className="flex gap-5">
              <span className="display shrink-0 text-[28px] text-canada">{i + 1}</span>
              <p className="text-[16px] leading-relaxed text-ink/75">{item}</p>
            </li>
          ))}
        </ol>

        <h3 className="display mt-16 text-[28px] md:text-[34px]">{t.methodology.crosswalkTitle}</h3>
        <div className="mt-6 overflow-x-auto rounded-[24px] border border-line">
          <table className="w-full min-w-[760px] border-collapse bg-paper text-left text-[14px]">
            <thead>
              <tr className="border-b border-line bg-paper-warm text-[12px] uppercase tracking-[0.08em] text-ink/55">
                <th className="px-4 py-3 font-semibold">{t.methodology.crosswalkCols.dest}</th>
                <th className="px-4 py-3 font-semibold">{t.methodology.crosswalkCols.region}</th>
                <th className="px-4 py-3 font-semibold">{t.methodology.crosswalkCols.iso}</th>
              </tr>
            </thead>
            <tbody>
              {rows
                .filter((r) => r.us_states_in_basket)
                .map((r) => (
                  <tr key={r.destination_in_cer_data} className="border-b border-line/60 last:border-0 hover:bg-paper-warm">
                    <td className="px-4 py-2.5 font-medium">{r.destination_in_cer_data}</td>
                    <td className="px-4 py-2.5">{r.market_region}</td>
                    <td className="px-4 py-2.5 text-ink/60">{r.iso_rto}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
