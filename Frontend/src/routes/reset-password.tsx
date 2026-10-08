import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — Darsh Dental Depot" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword("", password, confirmPassword);
      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password. Please try requesting a new link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="p-8 glass-card border border-border/70 rounded-3xl shadow-xl backdrop-blur-xl">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-[#12A488]/20 grid place-items-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-[#3FD1B3]" />
              </div>
              <h1 className="text-2xl font-bold font-heading">Password Reset!</h1>
              <p className="text-sm text-muted-foreground">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              <Button className="w-full rounded-xl mt-4 bg-primary dark:bg-[#12A488] dark:hover:bg-[#3FD1B3] text-white dark:text-[#04110E] font-bold cursor-pointer" onClick={() => nav({ to: "/login" })}>
                Sign In to Doctor Portal
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 dark:bg-[#12A488]/20 grid place-items-center mb-4 text-primary dark:text-[#3FD1B3]">
                  <Lock className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-bold font-heading">Set New Password</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose a new secure password for your Doctor Account.
                </p>
              </div>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Label className="mb-1.5 text-xs font-semibold">New Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 text-xs font-semibold">Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl py-5 bg-primary dark:bg-[#12A488] dark:hover:bg-[#3FD1B3] text-white dark:text-[#04110E] font-bold cursor-pointer" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-xs text-muted-foreground hover:text-primary dark:hover:text-[#3FD1B3] inline-flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Sign in
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </PublicLayout>
  );
}
