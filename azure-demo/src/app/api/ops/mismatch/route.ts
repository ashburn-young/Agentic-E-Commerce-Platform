import { NextResponse } from "next/server";
import { z } from "zod";

import { getStore, addAudit, bumpKpi } from "@/lib/store";

export const runtime = "nodejs";

const Req = z.object({
  poId: z.string().min(1),
  extracted: z.unknown(),
});

export async function POST(req: Request) {
  const body = Req.parse(await req.json().catch(() => ({})));
  const store = getStore();
  const po = store.purchaseOrders[body.poId];
  const mismatches: string[] = [];

  if (!po) {
    return NextResponse.json({ mismatches: [`PO not found: ${body.poId}`] }, { status: 404 });
  }

  // Since PO lines are empty in the upload step, mismatch logic here is illustrative.
  // We inspect extracted lines and flag suspicious patterns.
  const extractedLines = (body.extracted as any)?.lines as any[] | undefined;
  if (!extractedLines || extractedLines.length === 0) {
    mismatches.push("No line items detected by extraction.");
  } else {
    const highQty = extractedLines.find((l) => Number(l.qty) > 25);
    if (highQty) mismatches.push("Unusually high quantity detected on one line item.");
    const missingSku = extractedLines.find((l) => !l.sku);
    if (missingSku) mismatches.push("At least one line item is missing a SKU.");
  }

  if (mismatches.length) bumpKpi("mismatchesDetected", mismatches.length, "mismatches");
  addAudit({
    type: "ops.mismatch",
    summary: `Mismatch check: ${mismatches.length} issue(s)`,
    meta: { poId: po.id, mismatches },
  });

  return NextResponse.json({ mismatches });
}
