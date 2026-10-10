import fs from "node:fs";
import path from "node:path";

const DATA = path.join(process.cwd(), "data");

export interface MarginRow {
  year: number;
  origin_region: "West" | "East";
  market_region: "US West" | "US Midwest" | "PJM" | "NYISO" | "ISO-NE";
  corridor: string;
  export_price_cad_mwh: number;
  export_price_usd_mwh: number;
  us_market_price_usd_mwh: number;
  margin_usd_mwh: number;
  export_volume_mwh: number;
  margin_value_usd_millions: number;
  fx_cad_per_usd: number;
}

export interface InversionRow {
  year: number;
  west_cad_mwh: number;
  east_cad_mwh: number;
  west_usd_mwh: number | null;
  east_usd_mwh: number | null;
  west_minus_east_usd: number | null;
}

export interface CorridorInfo {
  corridor: string;
  origin_region: string;
  market_region: string;
  origin_provinces_en: string;
  origin_provinces_fr: string;
  market_states_en: string;
  market_states_fr: string;
  iso: string;
}

export interface CrosswalkRow {
  destination_in_cer_data: string;
  market_region: string;
  us_states_in_basket: string;
  iso_rto: string;
}

function splitCsvLine(ln: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < ln.length; i++) {
    const c = ln[i];
    if (c === '"') {
      if (inQ && ln[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (c === "," && !inQ) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

function parseCsv<T>(name: string, map: (r: Record<string, string>) => T): T[] {
  const text = fs.readFileSync(path.join(DATA, name), "utf8");
  const lines = text.trim().split("\n");
  const head = splitCsvLine(lines[0]);
  return lines.slice(1).map((ln) => {
    const cells = splitCsvLine(ln);
    const r: Record<string, string> = {};
    head.forEach((h, i) => {
      r[h.trim()] = (cells[i] ?? "").trim();
    });
    return map(r);
  });
}

const num = (v: string) => (v === "" ? null : Number(v));

let marginsCache: MarginRow[] | null = null;
let inversionCache: InversionRow[] | null = null;
let crosswalkCache: CrosswalkRow[] | null = null;

export function getMargins(): MarginRow[] {
  if (!marginsCache) {
    marginsCache = parseCsv("margins_annual.csv", (r) => ({
      year: Number(r.year),
      origin_region: r.origin_region as "West" | "East",
      market_region: r.market_region as MarginRow["market_region"],
      corridor: r.corridor,
      export_price_cad_mwh: Number(r.export_price_cad_mwh),
      export_price_usd_mwh: Number(r.export_price_usd_mwh),
      us_market_price_usd_mwh: Number(r.us_market_price_usd_mwh),
      margin_usd_mwh: Number(r.margin_usd_mwh),
      export_volume_mwh: Number(r.export_volume_mwh),
      margin_value_usd_millions: Number(r.margin_value_usd_millions),
      fx_cad_per_usd: Number(r.fx_cad_per_usd),
    }));
  }
  return marginsCache;
}

export function getInversion(): InversionRow[] {
  if (!inversionCache) {
    inversionCache = parseCsv("inversion_annual.csv", (r) => ({
      year: Number(r.year),
      west_cad_mwh: Number(r.west_cad_mwh),
      east_cad_mwh: Number(r.east_cad_mwh),
      west_usd_mwh: num(r.west_usd_mwh),
      east_usd_mwh: num(r.east_usd_mwh),
      west_minus_east_usd: num(r.west_minus_east_usd),
    }));
  }
  return inversionCache;
}

export function getCrosswalk(): CrosswalkRow[] {
  if (!crosswalkCache) {
    crosswalkCache = parseCsv("crosswalk.csv", (r) => ({
      destination_in_cer_data: r.destination_in_cer_data,
      market_region: r.market_region,
      us_states_in_basket: r.us_states_in_basket,
      iso_rto: r.iso_rto,
    }));
  }
  return crosswalkCache;
}

const CORRIDORS: CorridorInfo[] = [
  {
    corridor: "East to ISO-NE",
    origin_region: "East",
    market_region: "ISO-NE",
    origin_provinces_en: "Ontario, Quebec, New Brunswick",
    origin_provinces_fr: "Ontario, Québec, Nouveau-Brunswick",
    market_states_en: "Maine, New Hampshire, Vermont, Massachusetts, Connecticut, Rhode Island",
    market_states_fr: "Maine, New Hampshire, Vermont, Massachusetts, Connecticut, Rhode Island",
    iso: "ISO New England",
  },
  {
    corridor: "East to NYISO",
    origin_region: "East",
    market_region: "NYISO",
    origin_provinces_en: "Ontario, Quebec",
    origin_provinces_fr: "Ontario, Québec",
    market_states_en: "New York",
    market_states_fr: "New York",
    iso: "NYISO",
  },
  {
    corridor: "East to PJM",
    origin_region: "East",
    market_region: "PJM",
    origin_provinces_en: "Ontario, Quebec",
    origin_provinces_fr: "Ontario, Québec",
    market_states_en: "Pennsylvania, New Jersey, Maryland, Delaware, Virginia, West Virginia, Ohio",
    market_states_fr: "Pennsylvanie, New Jersey, Maryland, Delaware, Virginie, Virginie-Occidentale, Ohio",
    iso: "PJM Interconnection",
  },
  {
    corridor: "East to US Midwest",
    origin_region: "East",
    market_region: "US Midwest",
    origin_provinces_en: "Ontario",
    origin_provinces_fr: "Ontario",
    market_states_en: "Minnesota, North Dakota, South Dakota, Nebraska, Iowa, Kansas, Missouri, Wisconsin, Illinois, Indiana, Michigan",
    market_states_fr: "Minnesota, Dakota du Nord, Dakota du Sud, Nebraska, Iowa, Kansas, Missouri, Wisconsin, Illinois, Indiana, Michigan",
    iso: "MISO / SPP",
  },
  {
    corridor: "West to US Midwest",
    origin_region: "West",
    market_region: "US Midwest",
    origin_provinces_en: "Manitoba, Saskatchewan",
    origin_provinces_fr: "Manitoba, Saskatchewan",
    market_states_en: "Minnesota, North Dakota, South Dakota, Nebraska, Iowa, Kansas, Missouri, Wisconsin, Illinois, Indiana, Michigan",
    market_states_fr: "Minnesota, Dakota du Nord, Dakota du Sud, Nebraska, Iowa, Kansas, Missouri, Wisconsin, Illinois, Indiana, Michigan",
    iso: "MISO / SPP",
  },
  {
    corridor: "West to US West",
    origin_region: "West",
    market_region: "US West",
    origin_provinces_en: "British Columbia, Alberta",
    origin_provinces_fr: "Colombie-Britannique, Alberta",
    market_states_en: "Washington, Oregon, California, Idaho, Nevada, Arizona, Utah, Montana, Wyoming, Colorado, New Mexico",
    market_states_fr: "Washington, Oregon, Californie, Idaho, Nevada, Arizona, Utah, Montana, Wyoming, Colorado, Nouveau-Mexique",
    iso: "WECC / BPA / CAISO",
  },
];

export function getCorridors(): CorridorInfo[] {
  return CORRIDORS;
}

export interface SummaryStats {
  years: [number, number];
  corridor_count: number;
  cumulative_margin_usd_billions: number;
  top_corridor_2025: { corridor: string; margin_usd_mwh: number };
  top_corridor_cumulative: { corridor: string; value_usd_billions: number; volume_twh: number };
  inversion_crossover_year: number;
  inversion_peak: { year: number; west_minus_east_usd: number };
  california_crisis: { year: number; west_usd_mwh: number; east_usd_mwh: number };
  quarantined_rows: number;
}

export function getSummary(): SummaryStats {
  const margins = getMargins();
  const inversion = getInversion();
  const cum = new Map<string, { v: number; vol: number }>();
  for (const m of margins) {
    const c = cum.get(m.corridor) ?? { v: 0, vol: 0 };
    c.v += m.margin_value_usd_millions;
    c.vol += m.export_volume_mwh;
    cum.set(m.corridor, c);
  }
  const topCum = Array.from(cum.entries()).sort((a, b) => b[1].v - a[1].v)[0];
  const rows2025 = margins.filter((m) => m.year === 2025).sort((a, b) => b.margin_usd_mwh - a.margin_usd_mwh);
  const post = inversion.filter((r) => r.year >= 2018 && r.west_minus_east_usd !== null);
  const peak = [...inversion]
    .filter((r) => r.west_minus_east_usd !== null && r.year >= 2018)
    .sort((a, b) => (b.west_minus_east_usd ?? 0) - (a.west_minus_east_usd ?? 0))[0];
  const crisis = inversion.find((r) => r.year === 2001)!;
  return {
    years: [Math.min(...margins.map((m) => m.year)), Math.max(...margins.map((m) => m.year))],
    corridor_count: new Set(margins.map((m) => m.corridor)).size,
    cumulative_margin_usd_billions: Math.round((Array.from(cum.values()).reduce((s, c) => s + c.v, 0) / 1000) * 10) / 10,
    top_corridor_2025: { corridor: rows2025[0].corridor, margin_usd_mwh: rows2025[0].margin_usd_mwh },
    top_corridor_cumulative: {
      corridor: topCum[0],
      value_usd_billions: Math.round((topCum[1].v / 1000) * 100) / 100,
      volume_twh: Math.round((topCum[1].vol / 1e6) * 10) / 10,
    },
    inversion_crossover_year: post[0]?.year ?? 2018,
    inversion_peak: { year: peak.year, west_minus_east_usd: peak.west_minus_east_usd ?? 0 },
    california_crisis: { year: 2001, west_usd_mwh: crisis.west_usd_mwh ?? 0, east_usd_mwh: crisis.east_usd_mwh ?? 0 },
    quarantined_rows: 2,
  };
}
