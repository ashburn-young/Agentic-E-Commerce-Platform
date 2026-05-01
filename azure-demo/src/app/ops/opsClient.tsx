"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileUp, GitCompare, Send, ShieldCheck } from "lucide-react";

import type { PurchaseOrder } from "@/lib/types";
import { toPoText } from "@/lib/sampleData";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";

type UploadResponse = { po: PurchaseOrder; poText: string };
type ExtractResponse = { extracted: unknown; used: "mock" | "document_intelligence" };
type MismatchResponse = { mismatches: string[] };
type TeamsCardResponse = { card: unknown };

export function OpsClient() {
  const [poId, setPoId] = useState<string>("po-demo-2001");
  const [vendor, setVendor] = useState<string>("Fabrikam Supply");
  const [poText, setPoText] = useState<string>(
    "Purchase Order po-demo-2001\nVendor: Fabrikam Supply\nCurrency: USD\n\nLines:\n- SKU: FB-EDGE-01 | Secure Edge Router | Qty: 3 | Unit: $399.00\n- SKU: FB-OBS-10 | Ops Observability Pack | Qty: 8 | Unit: $129.00",
  );
  const [uploaded, setUploaded] = useState<PurchaseOrder | null>(null);
  const [extracted, setExtracted] = useState<any>(null);
  const [mismatches, setMismatches] = useState<string[]>([]);
  const [teamsCard, setTeamsCard] = useState<any>(null);
  const [approveResult, setApproveResult] = useState<PurchaseOrder | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      // prefill from sample PO occasionally
      const res = await fetch("/api/ops/sample").catch(() => null);
      if (!res || !res.ok) return;
      const data = (await res.json()) as { po: PurchaseOrder };
      setPoId(data.po.id);
      setVendor(data.po.vendor);
      setPoText(toPoText(data.po));
    })();
  }, []);

  const stage = useMemo(() => {
    if (approveResult) return "approved";
    if (teamsCard) return "teams";
    if (mismatches.length) return "mismatch";
    if (extracted) return "extracted";
    if (uploaded) return "uploaded";
    return "draft";
  }, [uploaded, extracted, mismatches.length, teamsCard, approveResult]);

  async function upload() {
    setBusy(true);
    setUploaded(null);
    setExtracted(null);
    setMismatches([]);
    setTeamsCard(null);
    setApproveResult(null);
    try {
      const res = await fetch("/api/ops/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ poId, vendor, poText }),
      });
      const data = (await res.json()) as UploadResponse;
      setUploaded(data.po);
      setPoText(data.poText);
    } finally {
      setBusy(false);
    }
  }

  async function extract() {
    setBusy(true);
    setExtracted(null);
    setMismatches([]);
    setTeamsCard(null);
    setApproveResult(null);
    try {
      const res = await fetch("/api/ops/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ poText }),
      });
      const data = (await res.json()) as ExtractResponse;
      setExtracted({ extracted: data.extracted, _used: data.used });
    } finally {
      setBusy(false);
    }
  }

  async function mismatch() {
    if (!uploaded) return;
    setBusy(true);
    setMismatches([]);
    setTeamsCard(null);
    setApproveResult(null);
    try {
      const res = await fetch("/api/ops/mismatch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ poId: uploaded.id, extracted }),
      });
      const data = (await res.json()) as MismatchResponse;
      setMismatches(data.mismatches);
    } finally {
      setBusy(false);
    }
  }

  async function teams() {
    if (!uploaded) return;
    setBusy(true);
    setTeamsCard(null);
    setApproveResult(null);
    try {
      const res = await fetch("/api/ops/teams-card", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ poId: uploaded.id, mismatches }),
      });
      const data = (await res.json()) as TeamsCardResponse;
      setTeamsCard(data.card);
    } finally {
      setBusy(false);
    }
  }

  async function approve() {
    if (!uploaded) return;
    setBusy(true);
    setApproveResult(null);
    try {
      const res = await fetch("/api/ops/approve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ poId: uploaded.id, action: "approve" }),
      });
      const data = (await res.json()) as { po: PurchaseOrder };
      setApproveResult(data.po);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ops"
        title="PO upload → extract → mismatch → Teams → approval"
        subtitle="A mock ops workflow with optional Azure AI Document Intelligence extraction."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold">Purchase order input</div>
            <div className="text-xs text-zinc-500">Stage: {stage}</div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-xs font-semibold text-zinc-500">PO ID</div>
              <Input value={poId} onChange={(e) => setPoId(e.target.value)} />
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold text-zinc-500">Vendor</div>
              <Input value={vendor} onChange={(e) => setVendor(e.target.value)} />
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-1 text-xs font-semibold text-zinc-500">PO text (mock PDF content)</div>
            <Textarea value={poText} onChange={(e) => setPoText(e.target.value)} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={upload} disabled={busy}>
              <FileUp className="h-4 w-4" /> Upload
            </Button>
            <Button variant="secondary" onClick={extract} disabled={busy || !poText.trim()}>
              <Send className="h-4 w-4" /> Extract
            </Button>
            <Button variant="secondary" onClick={mismatch} disabled={busy || !uploaded || !extracted}>
              <GitCompare className="h-4 w-4" /> Mismatch
            </Button>
            <Button variant="secondary" onClick={teams} disabled={busy || !uploaded}>
              <Send className="h-4 w-4" /> Teams card
            </Button>
            <Button variant="secondary" onClick={approve} disabled={busy || !uploaded}>
              <ShieldCheck className="h-4 w-4" /> Approve
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold">Outputs</div>
          <div className="mt-3 space-y-3 text-sm">
            <OutputBlock title="Uploaded" value={uploaded ? uploaded.id : "—"} />
            <OutputBlock
              title="Extraction"
              value={
                extracted
                  ? `ok (${String(extracted._used ?? "unknown")})`
                  : "—"
              }
            />
            <OutputBlock
              title="Mismatches"
              value={mismatches.length ? `${mismatches.length}` : "0"}
            />
            <OutputBlock title="Teams card" value={teamsCard ? "generated" : "—"} />
            <OutputBlock
              title="Approval"
              value={approveResult?.status ? approveResult.status : "—"}
            />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Mismatch details</div>
            {mismatches.length === 0 ? (
              <div className="text-xs text-emerald-700">No issues</div>
            ) : (
              <div className="text-xs text-amber-800">Needs attention</div>
            )}
          </div>
          <div className="mt-3">
            {mismatches.length === 0 ? (
              <div className="text-sm text-zinc-500">Run “Mismatch” to compare.</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {mismatches.map((m) => (
                  <li
                    key={m}
                    className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-900 dark:text-amber-100"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Teams adaptive card (preview)</div>
            {approveResult?.status === "approved" ? (
              <div className="flex items-center gap-2 text-xs text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> approved
              </div>
            ) : null}
          </div>
          <div className="mt-3">
            {teamsCard ? (
              <pre className="max-h-96 overflow-auto rounded-xl border border-black/5 bg-white/60 p-3 text-xs dark:border-white/10 dark:bg-white/5">
                {JSON.stringify(teamsCard, null, 2)}
              </pre>
            ) : (
              <div className="text-sm text-zinc-500">Generate a Teams card to preview JSON.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function OutputBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/5 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5">
      <div className="text-xs text-zinc-500">{title}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
