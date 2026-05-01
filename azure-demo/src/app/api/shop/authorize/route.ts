import { NextResponse } from "next/server";
import { z } from "zod";

import { addAudit, bumpKpi } from "@/lib/store";

export const runtime = "nodejs";

const Req = z.object({
  orderId: z.string().min(1),
  amountUsd: z.number().min(0),
});

export async function POST(req: Request) {
  const body = Req.parse(await req.json().catch(() => ({})));
  const approved = Math.random() > 0.04;
  const status = approved ? "authorized" : "declined";
  const authId = approved ? `auth-${Date.now().toString(16)}` : undefined;

  bumpKpi("ordersAuthorized", 1, "orders");
  addAudit({
    type: "shop.authorize",
    summary: `Authorization ${status} for ${body.orderId}`,
    meta: { orderId: body.orderId, amountUsd: body.amountUsd, status },
  });

  return NextResponse.json({ status, authId });
}
