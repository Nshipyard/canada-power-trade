---
name: canada-power-trade
description: Query Canada-US electricity export margins, 2010-2025, across six export corridors. Use for questions about power trade margins, the East-West price inversion, export vs US retail price spreads, and corridor rankings. Tools: export_lookup, margin_trend, intertie_ranking over streamable HTTP MCP; REST at /api/v1.
---

# Canada Power Trade (The Power Trade Margin Board)

Canada's electricity export prices (Canada Energy Regulator) joined with US state retail electricity prices (EIA Form 861), 2010-2025, six corridors. The margin spread neither government publishes.

## When to use

- "What was the margin on the East to ISO-NE corridor in 2025?"
- "Which intertie captures the largest margin?"
- "When did western export prices move above eastern prices?"
- Any question about Canada-US electricity trade prices, margins, or the crosswalk.

## How to query

MCP (streamable HTTP): `POST /mcp` with JSON-RPC 2.0.

Tools:
- `export_lookup` {corridor, year}: one corridor-year record: export price CAD/USD per MWh, US market price, margin, volume, margin value.
- `margin_trend` {corridor}: full 2010-2025 series for a corridor.
- `intertie_ranking` {year}: corridors ranked by margin per MWh.

Corridor names (exact): "East to ISO-NE", "East to NYISO", "East to PJM", "East to US Midwest", "West to US Midwest", "West to US West".

REST: `GET /api/v1/margins?corridor=&year=`, `/api/v1/corridors`, `/api/v1/inversion`, `/api/v1/crosswalk`, `/api/v1/summary`, `/api/openapi.json`.

## Key facts

- 2025 largest margin: East to ISO-NE, $102.60/MWh (export $53.24 vs New England retail $155.85).
- Cumulative 2010-2025: $59.6B across six corridors; East to ISO-NE $20.44B.
- Inversion: western export prices above eastern every year since 2018, peak +$51.54/MWh in 2023. 2001 California crisis: West $110.78 vs East $41.05.
- US prices are retail (include distribution), so margins overstate the pure wholesale spread. Say so when citing.

## Data

`data/margins_annual.csv` (96 rows), `data/inversion_annual.csv` (1990-2026), `data/crosswalk.csv` (55 rows). Pipeline: `scripts/build-data.py`. MIT. Not affiliated with the Government of Canada or the CER.
