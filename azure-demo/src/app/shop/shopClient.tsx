"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, CreditCard, PackageCheck, Search, Sparkles } from "lucide-react";

import type { CartLine, Product } from "@/lib/types";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";

type AssistResponse = {
  assistantText: string;
  suggestedCart: CartLine[];
  used: "mock" | "azure_openai";
};

type AssembleResponse = {
  orderId: string;
  lines: Array<{ product: Product; qty: number; lineTotalUsd: number }>;
  subtotalUsd: number;
  taxUsd: number;
  totalUsd: number;
};

export function ShopClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState(
    "I need a starter bundle for an agent demo plus some observability. Budget under $500.",
  );
  const [assistant, setAssistant] = useState<string>("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [assembled, setAssembled] = useState<AssembleResponse | null>(null);
  const [auth, setAuth] = useState<{ status: string; authId?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/shop/products");
      const data = (await res.json()) as { products: Product[] };
      setProducts(data.products);
    })();
  }, []);

  const cartSummary = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p] as const));
    const lines = cart
      .map((l) => {
        const p = byId.get(l.productId);
        if (!p) return null;
        return { product: p, qty: l.qty, lineTotalUsd: p.priceUsd * l.qty };
      })
      .filter(Boolean) as Array<{ product: Product; qty: number; lineTotalUsd: number }>;
    const subtotalUsd = lines.reduce((s, l) => s + l.lineTotalUsd, 0);
    return { lines, subtotalUsd };
  }, [cart, products]);

  async function assist() {
    setBusy(true);
    setAuth(null);
    setAssembled(null);
    try {
      const res = await fetch("/api/shop/assist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query, currentCart: cart }),
      });
      const data = (await res.json()) as AssistResponse;
      setAssistant(`${data.assistantText}\n\n(used: ${data.used})`);
      setCart(data.suggestedCart);
    } finally {
      setBusy(false);
    }
  }

  async function assemble() {
    setBusy(true);
    setAuth(null);
    try {
      const res = await fetch("/api/shop/assemble", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cart }),
      });
      const data = (await res.json()) as AssembleResponse;
      setAssembled(data);
    } finally {
      setBusy(false);
    }
  }

  async function authorize() {
    if (!assembled) return;
    setBusy(true);
    try {
      const res = await fetch("/api/shop/authorize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: assembled.orderId, amountUsd: assembled.totalUsd }),
      });
      const data = (await res.json()) as { status: string; authId?: string };
      setAuth(data);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Shop"
        title="Assist → Assemble → Authorize"
        subtitle="Use the shop agent to translate intent into a cart, then assemble an order and simulate an authorization step."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Search className="h-4 w-4" /> Shopper intent
            </div>
          </div>
          <div className="mt-3">
            <Textarea value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={assist} disabled={busy}>
              <Sparkles className="h-4 w-4" /> Assist
            </Button>
            <Button variant="secondary" onClick={assemble} disabled={busy || cart.length === 0}>
              <PackageCheck className="h-4 w-4" /> Assemble
            </Button>
            <Button variant="secondary" onClick={authorize} disabled={busy || !assembled}>
              <CreditCard className="h-4 w-4" /> Authorize
            </Button>
          </div>
          {assistant ? (
            <div className="mt-4 rounded-xl border border-black/5 bg-white/60 p-4 text-sm text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <Bot className="h-4 w-4" /> Assistant
              </div>
              <pre className="whitespace-pre-wrap font-sans">{assistant}</pre>
            </div>
          ) : null}
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold">Catalog</div>
          <div className="mt-3 space-y-3">
            {products.map((p) => (
              <div key={p.id} className="rounded-xl border border-black/5 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-xs text-zinc-600">{p.description}</div>
                  </div>
                  <div className="text-sm font-semibold">${p.priceUsd}</div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={cart.find((c) => c.productId === p.id)?.qty ?? 0}
                    onChange={(e) => {
                      const qty = Number(e.target.value || 0);
                      setCart((prev) => {
                        const next = prev.filter((x) => x.productId !== p.id);
                        if (qty > 0) next.push({ productId: p.id, qty });
                        return next;
                      });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="text-sm font-semibold">Cart</div>
          <div className="mt-3 space-y-2 text-sm">
            {cartSummary.lines.length === 0 ? (
              <div className="text-zinc-500">No items yet.</div>
            ) : (
              cartSummary.lines.map((l) => (
                <div key={l.product.id} className="flex items-center justify-between">
                  <div>
                    {l.product.name} <span className="text-zinc-500">× {l.qty}</span>
                  </div>
                  <div className="font-semibold">${l.lineTotalUsd.toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 text-sm dark:border-white/10">
            <div className="text-zinc-500">Subtotal</div>
            <div className="font-semibold">${cartSummary.subtotalUsd.toFixed(2)}</div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold">Order</div>
          <div className="mt-3 text-sm">
            {!assembled ? (
              <div className="text-zinc-500">Assemble to generate an order.</div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-zinc-500">Order ID</div>
                <div className="font-semibold">{assembled.orderId}</div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  <Kpi label="Subtotal" value={`$${assembled.subtotalUsd.toFixed(2)}`} />
                  <Kpi label="Tax" value={`$${assembled.taxUsd.toFixed(2)}`} />
                  <Kpi label="Total" value={`$${assembled.totalUsd.toFixed(2)}`} />
                </div>
              </div>
            )}
            {auth ? (
              <div className="mt-4 rounded-xl border border-black/5 bg-emerald-500/10 p-3 text-sm text-emerald-900 dark:border-white/10 dark:text-emerald-100">
                Authorization: <span className="font-semibold">{auth.status}</span>
                {auth.authId ? <span className="text-emerald-800"> • {auth.authId}</span> : null}
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/5 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
