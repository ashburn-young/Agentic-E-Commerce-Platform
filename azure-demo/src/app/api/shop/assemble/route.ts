import { NextResponse } from "next/server";
import { z } from "zod";

import { sampleProducts } from "@/lib/sampleData";
import { addAudit, bumpKpi } from "@/lib/store";
import type { Product } from "@/lib/types";

export const runtime = "nodejs";

const Req = z.object({
  cart: z.array(
    z.object({ productId: z.string(), qty: z.number().int().min(1).max(100) }),
  ),
});

export async function POST(req: Request) {
  const body = Req.parse(await req.json().catch(() => ({})));
  const byId = new Map(sampleProducts.map((p) => [p.id, p] as const));

  const lines: Array<{ product: Product; qty: number; lineTotalUsd: number }> = body.cart
    .map((l) => {
      const product = byId.get(l.productId);
      if (!product) return null;
      return {
        product,
        qty: l.qty,
        lineTotalUsd: product.priceUsd * l.qty,
      };
    })
    .filter(Boolean) as Array<{ product: Product; qty: number; lineTotalUsd: number }>;

  const subtotalUsd = lines.reduce((s, l) => s + l.lineTotalUsd, 0);
  const taxUsd = Math.round(subtotalUsd * 0.0825 * 100) / 100;
  const totalUsd = Math.round((subtotalUsd + taxUsd) * 100) / 100;
  const orderId = `ord-${Date.now().toString(16)}`;

  bumpKpi("ordersAssembled", 1, "orders");
  addAudit({
    type: "shop.assemble",
    summary: `Assembled order ${orderId} ($${totalUsd.toFixed(2)})`,
    meta: { orderId, totalUsd },
  });

  return NextResponse.json({ orderId, lines, subtotalUsd, taxUsd, totalUsd });
}
