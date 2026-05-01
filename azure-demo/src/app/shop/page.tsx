import type { Metadata } from "next";

import { ShopClient } from "@/app/shop/shopClient";

export const metadata: Metadata = {
  title: "Shop",
};

export default function ShopPage() {
  return <ShopClient />;
}
