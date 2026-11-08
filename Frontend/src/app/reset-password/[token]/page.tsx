import type { Metadata } from "next";
import ResetPasswordPage from "@/views/ResetPasswordTokenPage";

export const metadata: Metadata = {
  title: "Reset Password — Darsh Dental Depot",
};

export default function Page() {
  return <ResetPasswordPage />;
}
