import type { Metadata } from "next";
import ShopDashboard from "@/views/ShopDashboard";

export const metadata: Metadata = {
  title: "Shop Owner Dashboard — Darsh Dental Depot",
};

export default function Page() {
  return <ShopDashboard />;
}
