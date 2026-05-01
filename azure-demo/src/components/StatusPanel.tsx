"use client";

import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import type { ServiceStatusResponse } from "@/lib/types";
import { Badge, Card, cn } from "@/components/ui";

export function StatusPanel() {
  const [data, setData] = useState<ServiceStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch("/api/status");
        if (!res.ok) throw new Error("status fetch failed");
        const json = (await res.json()) as ServiceStatusResponse;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "failed");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    const id = setInterval(() => void load(), 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <Card className="flex items-center gap-2 px-3 py-2">
      <div className="text-xs font-semibold text-zinc-500">Services</div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          loading
        </div>
      ) : error || !data ? (
        <div className="flex items-center gap-2 text-xs text-amber-700">
          <AlertTriangle className="h-3.5 w-3.5" />
          unavailable
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1">
          <StatusBadge label="Mock" state={data.services.mock.state} />
          <StatusBadge label="Azure OpenAI" state={data.services.azureOpenAI.state} />
          <StatusBadge label="Doc Intel" state={data.services.documentIntelligence.state} />
        </div>
      )}
    </Card>
  );
}

function StatusBadge({
  label,
  state,
}: {
  label: string;
  state: "enabled" | "disabled" | "misconfigured";
}) {
  const tone =
    state === "enabled"
      ? "emerald"
      : state === "disabled"
        ? "zinc"
        : "amber";
  return (
    <Badge
      className={cn(
        tone === "emerald" && "bg-emerald-500/10 text-emerald-700",
        tone === "amber" && "bg-amber-500/10 text-amber-800",
        tone === "zinc" && "bg-zinc-500/10 text-zinc-700",
      )}
    >
      {state === "enabled" ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
      {label}
    </Badge>
  );
}
