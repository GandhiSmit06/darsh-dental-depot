import type { Metadata } from "next";
import RegisterPage from "@/views/RegisterPage";

export const metadata: Metadata = {
  title: "Vadodara Doctor & Clinic Registration — Darsh Dental Depot",
  description:
    "Exclusive portal registration for dental surgeons and clinics practicing in Vadodara, Gujarat.",
};

export default function Page() {
  return <RegisterPage />;
}
