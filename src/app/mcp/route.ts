import { NextResponse } from "next/server";
import { getMargins } from "@/lib/power";

// Minimal MCP server over streamable HTTP (JSON-RPC 2.0 via POST).
// Supports: initialize, tools/list, tools/call. Stateless.

const SERVER = { name: "canada-power-trade", version: "1.0.0" };

const TOOLS = [
  {
    name: "export_lookup",
    description:
      "Margin record for one export corridor in one year: export price in CAD and USD per MWh, US market price, margin per MWh, export volume, and margin value. Six corridors, 2010-2025.",
    inputSchema: {
      type: "object",
      properties: {
        corridor: {
          type: "string",
          description: "One of: East to ISO-NE, East to NYISO, East to PJM, East to US Midwest, West to US Midwest, West to US West",
        },
        year: { type: "integer", description: "2010-2025" },
      },
      required: ["corridor", "year"],
    },
  },
  {
    name: "margin_trend",
    description:
      "Year-by-year margin series for one corridor, 2010-2025: export price vs US market price and the margin spread per year.",
    inputSchema: {
      type: "object",
      properties: {
        corridor: {
          type: "string",
          description: "One of: East to ISO-NE, East to NYISO, East to PJM, East to US Midwest, West to US Midwest, West to US West",
        },
      },
      required: ["corridor"],
    },
  },
  {
    name: "intertie_ranking",
    description:
      "Corridors ranked by margin per MWh in a given year, with export price, US market price, volume, and margin value for each.",
    inputSchema: {
      type: "object",
      properties: {
        year: { type: "integer", description: "2010-2025, default 2025" },
      },
    },
  },
];

function ok(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}
function err(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}
function textResult(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function handle(msg: any) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return err(msg?.id ?? null, -32600, "Invalid Request");
  }
  const id = msg.id ?? null;
  switch (msg.method) {
    case "initialize":
      return ok(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: SERVER,
      });
    case "notifications/initialized":
      return null;
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const { name, arguments: args } = msg.params ?? {};
      try {
        const margins = getMargins();
        if (name === "export_lookup") {
          const corridor = String(args.corridor ?? "");
          const year = Number(args.year);
          const hit = margins.find(
            (m) => m.corridor.toLowerCase() === corridor.toLowerCase() && m.year === year
          );
          if (!hit) return err(id, -32001, `No record for ${corridor} in ${args.year}`);
          return ok(id, textResult(hit));
        }
        if (name === "margin_trend") {
          const corridor = String(args.corridor ?? "");
          const rows = margins
            .filter((m) => m.corridor.toLowerCase() === corridor.toLowerCase())
            .sort((a, b) => a.year - b.year);
          if (rows.length === 0) return err(id, -32001, `No corridor ${corridor}`);
          return ok(id, textResult({ corridor: rows[0].corridor, rows }));
        }
        if (name === "intertie_ranking") {
          const year = args.year ? Number(args.year) : 2025;
          const rows = margins
            .filter((m) => m.year === year)
            .sort((a, b) => b.margin_usd_mwh - a.margin_usd_mwh);
          return ok(id, textResult({ year, rows }));
        }
        return err(id, -32602, `Unknown tool ${name}`);
      } catch (e) {
        return err(id, -32000, `Tool error: ${(e as Error).message}`);
      }
    }
    default:
      return err(id, -32601, `Method not found: ${msg.method}`);
  }
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(err(null, -32700, "Parse error"), { status: 400 });
  }
  if (Array.isArray(body)) {
    const out = body.map(handle).filter((r) => r !== null);
    return NextResponse.json(out);
  }
  const out = handle(body);
  if (out === null) return new NextResponse(null, { status: 202 });
  return NextResponse.json(out);
}

export async function GET() {
  return NextResponse.json(
    { error: "This MCP server accepts JSON-RPC 2.0 via POST only." },
    { status: 405 }
  );
}

export async function DELETE() {
  return new NextResponse(null, { status: 405 });
}
