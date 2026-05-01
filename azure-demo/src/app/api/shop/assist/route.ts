import { NextResponse } from "next/server";
import { z } from "zod";

import { sampleProducts } from "@/lib/sampleData";
import { addAudit, bumpKpi } from "@/lib/store";
import { callAzureOpenAIResponse, azureOpenAIConfigured } from "@/lib/azureOpenAI";

export const runtime = "nodejs";

const Req = z.object({
  query: z.string().min(1).max(2000),
  currentCart: z
    .array(z.object({ productId: z.string(), qty: z.number().int().min(1).max(100) }))
    .default([]),
});

export async function POST(req: Request) {
  const body = Req.parse(await req.json().catch(() => ({})));

  const openai = azureOpenAIConfigured();
  let assistantText = "";
  let used: "mock" | "azure_openai" = "mock";

  if (openai.enabled && openai.configured) {
    try {
      const prompt = `You are a commerce assistant. Given the user's intent, suggest 1-3 products from this catalog and quantities.\n\nCatalog:\n${sampleProducts
        .map((p) => `- ${p.id}: ${p.name} ($${p.priceUsd}) — ${p.description}`)
        .join("\n")}\n\nUser intent:\n${body.query}\n\nReturn a brief recommendation and a JSON cart as an array of {productId, qty}.`;
      const r = await callAzureOpenAIResponse(prompt);
      assistantText = r.text;
      used = "azure_openai";
    } catch (err) {
      addAudit({
        type: "shop.assist",
        summary: "Azure OpenAI call failed",
        meta: { used: "azure_openai" },
      });

      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Azure OpenAI call failed";

      return NextResponse.json(
        {
          error: message.slice(0, 1000),
        },
        { status: 502 },
      );
    }
  }

  // Mock cart suggestion: pick by keyword heuristic
  const q = body.query.toLowerCase();
  const picks: Array<{ productId: string; qty: number }> = [];
  const addPick = (productId: string, qty: number) => {
    if (picks.find((p) => p.productId === productId)) return;
    picks.push({ productId, qty });
  };

  if (q.includes("observ")) addPick("p-ops-observability", 1);
  if (q.includes("agent")) addPick("p-ai-agent-template", 1);
  if (q.includes("vision")) addPick("p-vision-kit", 1);
  if (q.includes("security") || q.includes("edge")) addPick("p-secure-edge", 1);
  if (picks.length === 0) addPick("p-cloud-credits", 1);

  if (!assistantText) {
    const names = picks
      .map((p) => sampleProducts.find((x) => x.id === p.productId)?.name)
      .filter(Boolean)
      .join(", ");
    assistantText = `Suggested: ${names}. You can tweak quantities in the catalog panel.`;
  }

  bumpKpi("ordersAssisted", 1, "orders");
  addAudit({
    type: "shop.assist",
    summary: `Assisted shopping intent (used: ${used})`,
    meta: { used },
  });

  return NextResponse.json({ assistantText, suggestedCart: picks, used });
}
