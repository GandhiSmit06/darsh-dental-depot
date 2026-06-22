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

export const Route = createFileRoute("/reset-password/$token")({
  head: () => ({ meta: [{ title: "Reset Password — Darsh Dental Depot" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useParams();
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
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      toast.error("Password must contain uppercase, lowercase and number");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, password, confirmPassword);
      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: any) {
      if (err.name === "ApiError") {
        if (err.errors && err.errors.length > 0) {
          toast.error(err.errors[0].message);
        } else {
          toast.error(err.message || "Invalid or expired reset link.");
        }
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="p-8">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 grid place-items-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold">Password reset!</h1>
              <p className="text-sm text-muted-foreground">
                Your password has been successfully reset. You can now sign in
                with your new password.
              </p>
              <Button className="w-full" onClick={() => nav({ to: "/login" })}>
                Sign in
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 grid place-items-center mb-4">
                  <Lock className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Set new password</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Your new password must be at least 8 characters.
                </p>
              </div>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Label className="mb-1.5">New Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <Label className="mb-1.5">Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Resetting..." : "Reset password"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
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
