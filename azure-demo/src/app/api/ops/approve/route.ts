import { NextResponse } from "next/server";
import { z } from "zod";

import { getStore, addAudit, bumpKpi, upsertPO } from "@/lib/store";

export const runtime = "nodejs";

const Req = z.object({
  poId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
});

export async function POST(req: Request) {
  const body = Req.parse(await req.json().catch(() => ({})));
  const store = getStore();
  const po = store.purchaseOrders[body.poId];
  if (!po) {
    return NextResponse.json({ error: "PO not found" }, { status: 404 });
  }

  const status = body.action === "approve" ? "approved" : "rejected";
  const updated = upsertPO({ ...po, status });

  if (status === "approved") {
    bumpKpi("posApproved", 1, "approvals");
  }

  addAudit({
    type: "ops.approve",
    summary: `PO ${po.id} ${status}`,
    meta: { poId: po.id, status },
  });

  return NextResponse.json({ po: updated });
}
