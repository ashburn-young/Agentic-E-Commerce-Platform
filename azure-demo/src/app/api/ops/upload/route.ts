import { NextResponse } from "next/server";
import { z } from "zod";

import type { PurchaseOrder } from "@/lib/types";
import { addAudit, bumpKpi, upsertPO } from "@/lib/store";

export const runtime = "nodejs";

const Req = z.object({
  poId: z.string().min(1).max(64),
  vendor: z.string().min(1).max(120),
  poText: z.string().min(1).max(10000),
});

export async function POST(req: Request) {
  const body = Req.parse(await req.json().catch(() => ({})));

  const po: PurchaseOrder = {
    id: body.poId,
    vendor: body.vendor,
    createdAt: new Date().toISOString(),
    currency: "USD",
    status: "pending_approval",
    lines: [],
  };

  upsertPO(po);
  bumpKpi("posUploaded", 1);
  addAudit({
    type: "ops.upload",
    summary: `PO uploaded: ${po.id} (${po.vendor})`,
    meta: { poId: po.id },
  });

  return NextResponse.json({ po, poText: body.poText });
}
