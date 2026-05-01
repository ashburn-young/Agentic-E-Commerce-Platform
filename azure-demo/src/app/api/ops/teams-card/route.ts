import { NextResponse } from "next/server";
import { z } from "zod";

import { getStore, addAudit } from "@/lib/store";
import { buildTeamsAdaptiveCard } from "@/lib/teamsCard";

export const runtime = "nodejs";

const Req = z.object({
  poId: z.string().min(1),
  mismatches: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
  const body = Req.parse(await req.json().catch(() => ({})));
  const po = getStore().purchaseOrders[body.poId];
  if (!po) {
    return NextResponse.json({ error: "PO not found" }, { status: 404 });
  }
  const card = buildTeamsAdaptiveCard(po, body.mismatches);
  addAudit({
    type: "ops.teams_card",
    summary: `Generated Teams card for ${po.id}`,
    meta: { poId: po.id },
  });
  return NextResponse.json({ card });
}
