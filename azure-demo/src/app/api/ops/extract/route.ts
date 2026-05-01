import { NextResponse } from "next/server";
import { z } from "zod";

import {
  analyzeDocumentMock,
  analyzeWithAzureDocumentIntelligence,
  documentIntelligenceConfigured,
} from "@/lib/docIntelligence";
import { addAudit, bumpKpi } from "@/lib/store";

export const runtime = "nodejs";

const Req = z.object({
  poText: z.string().min(1).max(20000),
  // Optional base64 to support future file upload UI
  base64Document: z.string().optional(),
});

export async function POST(req: Request) {
  const body = Req.parse(await req.json().catch(() => ({})));
  const docintel = documentIntelligenceConfigured();

  let extracted: unknown;
  let used: "mock" | "document_intelligence" = "mock";

  if (docintel.enabled && docintel.configured && body.base64Document) {
    try {
      extracted = await analyzeWithAzureDocumentIntelligence(body.base64Document);
      used = "document_intelligence";
    } catch {
      extracted = await analyzeDocumentMock(body.poText);
      used = "mock";
    }
  } else {
    extracted = await analyzeDocumentMock(body.poText);
    used = "mock";
  }

  bumpKpi("posUploaded", 0);
  addAudit({
    type: "ops.extract",
    summary: `PO extraction complete (used: ${used})`,
    meta: { used },
  });

  return NextResponse.json({ extracted, used });
}
