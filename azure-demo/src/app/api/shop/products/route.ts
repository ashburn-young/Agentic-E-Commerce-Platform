import { NextResponse } from "next/server";

import { sampleProducts } from "@/lib/sampleData";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ products: sampleProducts });
}
