import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — Darsh Dental Depot" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setIsSent(true);
      toast.success("Password reset email sent!");
    } catch {
      // Still show success to prevent email enumeration
      setIsSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="p-8">
          {isSent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 grid place-items-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                If an account exists with <strong>{email}</strong>, we've sent a
                password reset link. Please check your inbox and spam folder.
              </p>
              <p className="text-xs text-muted-foreground">
                The link will expire in 1 hour.
              </p>
              <div className="pt-2 space-y-2">
                <Button variant="outline" className="w-full" onClick={() => setIsSent(false)}>
                  Try another email
                </Button>
                <Link to="/login" className="block">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign in
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 grid place-items-center mb-4">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Forgot password?</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  No worries, we'll send you reset instructions.
                </p>
              </div>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Label className="mb-1.5">Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send reset link"}
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
