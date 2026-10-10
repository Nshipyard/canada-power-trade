import { NextResponse } from "next/server";
import { getInversion } from "@/lib/power";

export async function GET() {
  const rows = getInversion();
  return NextResponse.json({ total: rows.length, rows });
}
