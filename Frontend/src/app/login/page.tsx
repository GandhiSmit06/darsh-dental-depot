import type { Metadata } from "next";
import LoginPage from "@/views/LoginPage";

export const metadata: Metadata = {
  title: "Doctor & Clinic Login — Darsh Dental Depot",
};

export default function Page() {
  return <LoginPage />;
}
