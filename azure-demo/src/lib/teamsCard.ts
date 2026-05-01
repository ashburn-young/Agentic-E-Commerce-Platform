import type { PurchaseOrder } from "@/lib/types";

export function buildTeamsAdaptiveCard(po: PurchaseOrder, mismatches: string[]) {
  const total = po.lines.reduce((sum, l) => sum + l.qty * l.unitPriceUsd, 0);
  return {
    type: "AdaptiveCard",
    version: "1.5",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    body: [
      {
        type: "TextBlock",
        text: `PO Approval: ${po.id}`,
        weight: "Bolder",
        size: "Large",
      },
      {
        type: "FactSet",
        facts: [
          { title: "Vendor", value: po.vendor },
          { title: "Status", value: po.status },
          { title: "Total", value: `$${total.toFixed(2)}` },
        ],
      },
      {
        type: "TextBlock",
        text: "Line items",
        weight: "Bolder",
        spacing: "Medium",
      },
      ...po.lines.map((l) => ({
        type: "TextBlock",
        wrap: true,
        text: `• ${l.sku} — ${l.description} (${l.qty} × $${l.unitPriceUsd.toFixed(2)})`,
      })),
      ...(mismatches.length
        ? [
            {
              type: "TextBlock",
              text: "Mismatches",
              weight: "Bolder",
              color: "Attention",
              spacing: "Medium",
            },
            ...mismatches.map((m) => ({
              type: "TextBlock",
              wrap: true,
              text: `• ${m}`,
              color: "Attention",
            })),
          ]
        : []),
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Approve",
        data: { action: "approve", poId: po.id },
      },
      {
        type: "Action.Submit",
        title: "Reject",
        data: { action: "reject", poId: po.id },
      },
    ],
  };
}
