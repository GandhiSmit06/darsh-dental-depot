import type { Metadata } from "next";
import DoctorDashboard from "@/views/DoctorDashboard";

export const metadata: Metadata = {
  title: "Doctor Dashboard — Darsh Dental Depot",
};

export default function Page() {
  return <DoctorDashboard />;
}
