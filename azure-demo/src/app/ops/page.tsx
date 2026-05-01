import type { Metadata } from "next";

import { OpsClient } from "@/app/ops/opsClient";

export const metadata: Metadata = {
  title: "Ops",
};

export default function OpsPage() {
  return <OpsClient />;
}
