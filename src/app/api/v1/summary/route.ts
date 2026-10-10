import { NextResponse } from "next/server";
import { getSummary } from "@/lib/power";

export async function GET() {
  return NextResponse.json(getSummary());
}
