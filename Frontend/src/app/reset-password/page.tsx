import type { Metadata } from "next";
import ResetPasswordPage from "@/views/ResetPasswordPage";

export const metadata: Metadata = {
  title: "Reset Password — Darsh Dental Depot",
};

export default function Page() {
  return <ResetPasswordPage />;
}
