import { NextResponse } from "next/server";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "The Power Trade Margin Board API",
    version: "1.0.0",
    description:
      "Canada-US electricity export margins, 2010-2025: CER export prices joined with EIA US state retail prices across six export corridors, plus the 1990-2026 West/East price inversion series and the hand-curated corridor crosswalk.",
  },
  servers: [{ url: "/api/v1", description: "Relative to the deployment origin" }],
  paths: {
    "/margins": {
      get: {
        summary: "Margin rows by corridor and year",
        parameters: [
          { name: "corridor", in: "query", schema: { type: "string" }, description: "e.g. East to ISO-NE" },
          { name: "year", in: "query", schema: { type: "integer" }, description: "e.g. 2025" },
        ],
        responses: { "200": { description: "Margin rows" } },
      },
    },
    "/corridors": {
      get: { summary: "The six export corridors with provinces, states, and grid operators", responses: { "200": { description: "Corridors" } } },
    },
    "/inversion": {
      get: { summary: "West versus East export prices, 1990-2026", responses: { "200": { description: "Inversion series" } } },
    },
    "/crosswalk": {
      get: { summary: "Hand-curated destination-to-market-region crosswalk", responses: { "200": { description: "Crosswalk rows" } } },
    },
    "/summary": {
      get: { summary: "Headline aggregates", responses: { "200": { description: "Summary stats" } } },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
