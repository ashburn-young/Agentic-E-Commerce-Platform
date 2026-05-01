import type { Product, PurchaseOrder } from "@/lib/types";

export const sampleProducts: Product[] = [
  {
    id: "p-vision-kit",
    name: "Vision Starter Kit",
    description: "A curated bundle for vision workloads: camera, SDK credits, and a quickstart.",
    priceUsd: 249,
    tag: "ai",
  },
  {
    id: "p-secure-edge",
    name: "Secure Edge Router",
    description: "Hardened edge router with policy packs and zero-touch provisioning.",
    priceUsd: 399,
    tag: "security",
  },
  {
    id: "p-ops-observability",
    name: "Ops Observability Pack",
    description: "Dashboards + alerts templates for reliability teams.",
    priceUsd: 129,
    tag: "ops",
  },
  {
    id: "p-cloud-credits",
    name: "Cloud Credits Bundle",
    description: "A small credit bundle for demos and workshops (mock-billed).",
    priceUsd: 99,
    tag: "cloud",
  },
  {
    id: "p-ai-agent-template",
    name: "Agent Template: Commerce",
    description: "A starter template for an agentic commerce workflow (prompt + guardrails).",
    priceUsd: 179,
    tag: "ai",
  },
];

export const samplePOs: PurchaseOrder[] = [
  {
    id: "po-1001",
    vendor: "Northwind Industrial",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    currency: "USD",
    status: "pending_approval",
    lines: [
      { sku: "NW-EDGE-01", description: "Secure Edge Router", qty: 4, unitPriceUsd: 399 },
      { sku: "NW-OBS-10", description: "Ops Observability Pack", qty: 10, unitPriceUsd: 129 },
    ],
  },
  {
    id: "po-1002",
    vendor: "Contoso Research",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    currency: "USD",
    status: "draft",
    lines: [
      { sku: "CT-VISION-01", description: "Vision Starter Kit", qty: 2, unitPriceUsd: 249 },
      { sku: "CT-AI-AGT", description: "Agent Template: Commerce", qty: 1, unitPriceUsd: 179 },
    ],
  },
];

export function toPoText(po: PurchaseOrder) {
  const lines = po.lines
    .map(
      (l) =>
        `- SKU: ${l.sku} | ${l.description} | Qty: ${l.qty} | Unit: $${l.unitPriceUsd.toFixed(
          2,
        )}`,
    )
    .join("\n");
  return `Purchase Order ${po.id}\nVendor: ${po.vendor}\nCurrency: ${po.currency}\n\nLines:\n${lines}`;
}
