import type { Metadata } from "next";
import ForgotPasswordPage from "@/views/ForgotPasswordPage";

export const metadata: Metadata = {
  title: "Reset Password via OTP — Darsh Dental Depot",
};

export default function Page() {
  return <ForgotPasswordPage />;
}
