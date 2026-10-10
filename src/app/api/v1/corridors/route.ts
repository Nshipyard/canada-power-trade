import { NextResponse } from "next/server";
import { getCorridors } from "@/lib/power";

export async function GET() {
  const rows = getCorridors();
  return NextResponse.json({ total: rows.length, rows });
}
