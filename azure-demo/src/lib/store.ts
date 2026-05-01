import type { AuditEvent, KPI, KPITrendPoint, PurchaseOrder } from "@/lib/types";

export type DemoStore = {
  audit: AuditEvent[];
  kpi: KPI;
  trend: KPITrendPoint[];
  purchaseOrders: Record<string, PurchaseOrder>;
};

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function ensureTrendPoint(store: DemoStore) {
  const bucket = new Date();
  bucket.setSeconds(0, 0);
  const ts = bucket.toISOString();
  const existing = store.trend.find((p) => p.ts === ts);
  if (existing) return existing;
  const point: KPITrendPoint = {
    ts,
    orders: 0,
    approvals: 0,
    mismatches: 0,
  };
  store.trend.push(point);
  store.trend.sort((a, b) => a.ts.localeCompare(b.ts));
  if (store.trend.length > 120) store.trend.splice(0, store.trend.length - 120);
  return point;
}

function initStore(): DemoStore {
  return {
    audit: [],
    kpi: {
      ordersAssisted: 0,
      ordersAssembled: 0,
      ordersAuthorized: 0,
      posUploaded: 0,
      posApproved: 0,
      mismatchesDetected: 0,
    },
    trend: [],
    purchaseOrders: {},
  };
}

export function getStore(): DemoStore {
  const globalForStore = globalThis as unknown as { __AGENTIC_COMMERCE_DEMO_STORE__?: DemoStore };
  if (!globalForStore.__AGENTIC_COMMERCE_DEMO_STORE__) {
    globalForStore.__AGENTIC_COMMERCE_DEMO_STORE__ = initStore();
  }
  return globalForStore.__AGENTIC_COMMERCE_DEMO_STORE__;
}

export function addAudit(event: Omit<AuditEvent, "id" | "ts">) {
  const store = getStore();
  const full: AuditEvent = { id: makeId("evt"), ts: nowIso(), ...event };
  store.audit.unshift(full);
  if (store.audit.length > 200) store.audit.splice(200);
  return full;
}

export function bumpKpi(
  key: keyof KPI,
  delta = 1,
  trendKey?: keyof Pick<KPITrendPoint, "orders" | "approvals" | "mismatches">,
) {
  const store = getStore();
  store.kpi[key] += delta;
  if (trendKey) {
    const point = ensureTrendPoint(store);
    point[trendKey] += delta;
  }
}

export function upsertPO(po: PurchaseOrder) {
  const store = getStore();
  store.purchaseOrders[po.id] = po;
  return po;
}

export function listPOs() {
  const store = getStore();
  return Object.values(store.purchaseOrders).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}
