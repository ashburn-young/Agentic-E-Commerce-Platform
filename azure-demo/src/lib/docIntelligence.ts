import { env } from "@/lib/env";

export type ExtractedPO = {
  vendor?: string;
  poNumber?: string;
  lines?: Array<{ sku?: string; description?: string; qty?: number; unitPriceUsd?: number }>;
  raw?: unknown;
};

export function documentIntelligenceConfigured() {
  if (!env.useDocumentIntelligence) return { enabled: false, configured: false };
  const ok = Boolean(env.documentIntelligenceEndpoint && env.documentIntelligenceApiKey);
  return { enabled: true, configured: ok };
}

export async function analyzeDocumentMock(text: string): Promise<ExtractedPO> {
  // Minimal heuristic parser; good enough for a demo.
  const vendorMatch = text.match(/Vendor:\s*(.+)/i);
  const poMatch = text.match(/Purchase Order\s+([^\s]+)/i);

  const lineRegex = /SKU:\s*([^|]+)\|\s*([^|]+)\|\s*Qty:\s*(\d+)\s*\|\s*Unit:\s*\$([0-9.]+)/gi;
  const lines: ExtractedPO["lines"] = [];
  let m: RegExpExecArray | null;
  while ((m = lineRegex.exec(text))) {
    lines.push({
      sku: m[1]?.trim(),
      description: m[2]?.trim(),
      qty: Number(m[3]),
      unitPriceUsd: Number(m[4]),
    });
  }

  return {
    vendor: vendorMatch?.[1]?.trim(),
    poNumber: poMatch?.[1]?.trim(),
    lines,
    raw: { mode: "mock" },
  };
}

export async function analyzeWithAzureDocumentIntelligence(_base64: string): Promise<ExtractedPO> {
  // Optional integration, best-effort implementation. Only used when env vars are set.
  if (!env.documentIntelligenceEndpoint || !env.documentIntelligenceApiKey) {
    throw new Error("Document Intelligence is not configured");
  }

  const endpoint = env.documentIntelligenceEndpoint.replace(/\/$/, "");
  const apiVersion = env.documentIntelligenceApiVersion;

  // NOTE: This demo intentionally does not require Azure credentials.
  // If configured, we attempt a layout analysis request.
  const url = `${endpoint}/documentintelligence/documentModels/prebuilt-layout:analyze?api-version=${encodeURIComponent(
    apiVersion,
  )}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Ocp-Apim-Subscription-Key": env.documentIntelligenceApiKey,
    },
    body: JSON.stringify({
      base64Source: _base64,
    }),
  });

  const raw = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Document Intelligence request failed (${res.status})`);
  }

  // Parsing into PO fields is model-dependent; keep raw and fall back to mock mapping.
  return { raw };
}
