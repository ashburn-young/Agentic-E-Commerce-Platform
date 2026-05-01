import { NextResponse } from "next/server";

import { samplePOs } from "@/lib/sampleData";
import { upsertPO } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  // Seed store with a sample PO note: store is in-memory so re-seed is harmless.
  const po = samplePOs[0];
  upsertPO(po);
  return NextResponse.json({ po });
}
