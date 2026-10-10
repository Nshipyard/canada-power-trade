import { NextResponse } from "next/server";
import { getMargins } from "@/lib/power";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const corridor = url.searchParams.get("corridor");
  const year = url.searchParams.get("year");
  const rows = getMargins().filter(
    (m) =>
      (!corridor || m.corridor.toLowerCase() === corridor.toLowerCase()) &&
      (!year || m.year === Number(year))
  );
  return NextResponse.json({ total: rows.length, rows });
}
