import { NextResponse } from "next/server";

import { getStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const store = getStore();
  return NextResponse.json({ kpi: store.kpi, trend: store.trend });
}
