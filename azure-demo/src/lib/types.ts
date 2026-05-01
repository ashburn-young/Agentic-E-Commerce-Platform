export type ServiceState = "enabled" | "disabled" | "misconfigured";

export type ServiceStatusResponse = {
  now: string;
  services: {
    mock: { state: ServiceState; detail?: string };
    azureOpenAI: { state: ServiceState; detail?: string };
    documentIntelligence: { state: ServiceState; detail?: string };
  };
};

export type Product = {
  id: string;
  name: string;
  description: string;
  priceUsd: number;
  tag: "ai" | "cloud" | "security" | "ops";
};

export type CartLine = {
  productId: string;
  qty: number;
};

export type PurchaseOrderLine = {
  sku: string;
  description: string;
  qty: number;
  unitPriceUsd: number;
};

export type PurchaseOrder = {
  id: string;
  vendor: string;
  createdAt: string;
  currency: "USD";
  lines: PurchaseOrderLine[];
  status: "draft" | "pending_approval" | "approved" | "rejected";
};

export type AuditEvent = {
  id: string;
  ts: string;
  type:
    | "shop.assist"
    | "shop.assemble"
    | "shop.authorize"
    | "ops.upload"
    | "ops.extract"
    | "ops.mismatch"
    | "ops.teams_card"
    | "ops.approve";
  summary: string;
  meta?: Record<string, unknown>;
};

export type KPI = {
  ordersAssisted: number;
  ordersAssembled: number;
  ordersAuthorized: number;
  posUploaded: number;
  posApproved: number;
  mismatchesDetected: number;
};

export type KPITrendPoint = {
  ts: string;
  orders: number;
  approvals: number;
  mismatches: number;
};
