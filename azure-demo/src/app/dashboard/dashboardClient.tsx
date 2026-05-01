"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, ClipboardCheck, ShoppingCart, TriangleAlert } from "lucide-react";

import type { AuditEvent, KPI, KPITrendPoint } from "@/lib/types";
import { Card, cn } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";

type MetricsResponse = {
  kpi: KPI;
  trend: KPITrendPoint[];
};

export function DashboardClient() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [audit, setAudit] = useState<{ audit: AuditEvent[] } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [m, a] = await Promise.all([
        fetch("/api/metrics").then((r) => r.json() as Promise<MetricsResponse>),
        fetch("/api/audit").then((r) => r.json() as Promise<{ audit: AuditEvent[] }>),
      ]);
      if (cancelled) return;
      setMetrics(m);
      setAudit(a);
    };
    void load();
    const id = setInterval(() => void load(), 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="KPIs and audit trail"
        subtitle="This demo uses a global in-memory store to track actions and generate charts. Refresh-safe in dev, and mock-first by default."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ShoppingCart className="h-4 w-4" />}
          label="Orders assisted"
          value={metrics?.kpi.ordersAssisted ?? 0}
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="Orders authorized"
          value={metrics?.kpi.ordersAuthorized ?? 0}
        />
        <StatCard
          icon={<ClipboardCheck className="h-4 w-4" />}
          label="POs approved"
          value={metrics?.kpi.posApproved ?? 0}
        />
        <StatCard
          icon={<TriangleAlert className="h-4 w-4" />}
          label="Mismatches"
          value={metrics?.kpi.mismatchesDetected ?? 0}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="text-sm font-semibold">Trends (per minute)</div>
          <div className="mt-4 h-72">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.trend ?? []} margin={{ left: 0, right: 12, top: 6, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
                  <XAxis dataKey="ts" tickFormatter={(v) => String(v).slice(11, 16)} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="orders" stroke="#6366f1" fill="url(#g1)" />
                  <Area type="monotone" dataKey="approvals" stroke="#10b981" fill="url(#g2)" />
                  <Area type="monotone" dataKey="mismatches" stroke="#f59e0b" fill="url(#g3)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-black/5 bg-white/60 text-sm text-zinc-500 dark:border-white/10 dark:bg-white/5">
                Loading chart…
              </div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold">Audit feed</div>
          <div className="mt-4 max-h-72 space-y-2 overflow-auto">
            {(audit?.audit ?? []).slice(0, 50).map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-black/5 bg-white/60 p-3 text-sm dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{e.type}</div>
                  <div className="text-xs text-zinc-500">{e.ts.slice(11, 19)}</div>
                </div>
                <div className="mt-1 text-zinc-600">{e.summary}</div>
              </div>
            ))}
            {(audit?.audit?.length ?? 0) === 0 ? (
              <div className="text-sm text-zinc-500">No events yet. Use /shop or /ops.</div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "indigo" | "emerald" | "amber";
}) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-500/10 text-amber-800"
      : tone === "emerald"
        ? "bg-emerald-500/10 text-emerald-800"
        : "bg-indigo-500/10 text-indigo-700";
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-zinc-500">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
        </div>
        <div className={cn("rounded-xl p-2", toneClass)}>{icon}</div>
      </div>
    </Card>
  );
}
