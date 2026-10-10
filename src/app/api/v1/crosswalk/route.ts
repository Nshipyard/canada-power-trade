import { NextResponse } from "next/server";
import { getCrosswalk } from "@/lib/power";

export async function GET() {
  const rows = getCrosswalk();
  return NextResponse.json({ total: rows.length, rows });
}
