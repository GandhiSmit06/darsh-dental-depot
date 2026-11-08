import type { Metadata } from "next";
import AdminDashboard from "@/views/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard — Darsh Dental Depot",
};

export default function Page() {
  return <AdminDashboard />;
}
