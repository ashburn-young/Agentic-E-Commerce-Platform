import Link from "next/link";
import { ArrowRight, Bot, ClipboardCheck, LayoutDashboard, ShoppingBag } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui";

export default function Home() {
  return (
    <main className="relative">
      <div className="pointer-events-none absolute inset-0 noise" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Agentic demo"
          title="Azure Agentic Commerce"
          subtitle="A mock-first commerce + ops workflow that can optionally call Azure OpenAI (Responses API) and Azure AI Document Intelligence—controlled entirely by env vars."
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-zinc-500">Shop agent</div>
                <div className="mt-1 text-lg font-semibold">Assist → Assemble → Authorize</div>
              </div>
              <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-sm text-zinc-600">
              Turn a shopper’s intent into a cart, assemble an order, and simulate authorization.
            </p>
            <Link
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              href="/shop"
            >
              Open Shop <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-zinc-500">Ops agent</div>
                <div className="mt-1 text-lg font-semibold">PO upload → extract → approve</div>
              </div>
              <div className="rounded-xl bg-sky-500/10 p-2 text-sky-700">
                <ClipboardCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-sm text-zinc-600">
              Mock PO ingestion + extraction, mismatch detection, Teams card preview, and approval.
            </p>
            <Link
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-800"
              href="/ops"
            >
              Open Ops <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-zinc-500">Telemetry</div>
                <div className="mt-1 text-lg font-semibold">KPIs + audit trail</div>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-700">
                <LayoutDashboard className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-sm text-zinc-600">
              In-memory metrics store powering a dashboard and audit feed (no DB required).
            </p>
            <Link
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              href="/dashboard"
            >
              Open Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>

        <div className="mt-10 rounded-2xl border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Bot className="h-4 w-4" />
            What’s included
          </div>
          <ul className="mt-3 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
            <li>Mock-first API routes with Zod validation</li>
            <li>Optional Azure OpenAI Responses API integration via env vars</li>
            <li>Optional Azure AI Document Intelligence integration via env vars</li>
            <li>Service status panel (configured/enabled/fallback)</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
