import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle2, Lock, KeyRound, RotateCcw, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset Password via OTP — Darsh Dental Depot" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const nav = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [step, setStep] = useState<"send_otp" | "verify_otp">("send_otp");
  
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Resend countdown timer
  useEffect(() => {
    if (step === "verify_otp" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId) {
      toast.error("Please enter your registered Gmail or 10-digit Mobile number");
      return;
    }

    setIsSending(true);
    try {
      const res = await authApi.sendPasswordResetOtp(cleanId);
      setTargetEmail(res.email || cleanId);
      setStep("verify_otp");
      setCountdown(60);
      toast.success(res.message || "Password reset OTP sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset OTP. Check if account exists.");
    } finally {
      setIsSending(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setIsSending(true);
    try {
      const res = await authApi.sendPasswordResetOtp(identifier.trim());
      setCountdown(60);
      toast.success(res.message || "New 6-digit OTP code sent!");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend OTP.");
    } finally {
      setIsSending(false);
    }
  };

  // Step 3: Verify OTP and Set New Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.trim().length < 6) {
      toast.error("Please enter the 6-digit OTP code sent to your email");
      return;
    }

    if (password.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsResetting(true);
    try {
      await authApi.verifyPasswordResetOtp({
        identifier: identifier.trim(),
        otp: otp.trim(),
        password,
      });

      setIsSuccess(true);
      toast.success("Password reset successfully! You can now sign in.");
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired OTP code.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 max-w-md relative">
        {/* Glow behind card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="p-8 sm:p-10 glass-card border border-border/70 rounded-3xl shadow-xl backdrop-blur-xl">
            {isSuccess ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center mb-4 shadow-sm">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold font-heading text-foreground">Password Reset!</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your password has been successfully updated. You can now log in to your Doctor Portal with your new password.
                </p>
                <div className="pt-4">
                  <Button
                    className="w-full rounded-2xl h-12 text-sm font-bold bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg btn-shine"
                    onClick={() => nav({ to: "/login" })}
                  >
                    Sign In to Doctor Portal
                  </Button>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {step === "send_otp" ? (
                  <motion.div
                    key="step-send"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Header */}
                    <div className="text-center mb-6 space-y-1.5">
                      <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-sky-600 to-indigo-600 text-white grid place-items-center mb-3 shadow-md">
                        <KeyRound className="h-6 w-6" />
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-foreground">
                        Forgot Password?
                      </h1>
                      <p className="text-xs text-muted-foreground">
                        Enter your registered email or mobile number to receive a reset OTP code.
                      </p>
                    </div>

                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block">
                          Registered Gmail or 10-Digit Mobile *
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="dr.patel@gmail.com or 9876543210"
                            className="pl-10 rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            autoFocus
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSending}
                        className="w-full rounded-2xl h-12 text-sm font-bold bg-gradient-to-r from-primary via-sky-600 to-indigo-600 hover:opacity-95 text-white shadow-lg shadow-primary/20 btn-shine mt-2"
                      >
                        {isSending ? "Sending OTP Code..." : "Send Reset OTP Code"}
                      </Button>
                    </form>

                    <div className="mt-6 text-center">
                      <Link
                        to="/login"
                        className="text-xs font-semibold text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign in
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-verify"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Header */}
                    <div className="text-center mb-6 space-y-1.5">
                      <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center mb-3 shadow-sm">
                        <Lock className="h-6 w-6" />
                      </div>
                      <h1 className="text-2xl font-bold font-heading text-foreground">
                        Enter OTP & Set Password
                      </h1>
                      <p className="text-xs text-muted-foreground">
                        6-digit reset code sent to:{" "}
                        <span className="font-semibold text-foreground">{targetEmail || identifier}</span>
                      </p>
                    </div>

                    <form onSubmit={handleResetSubmit} className="space-y-4">
                      {/* OTP Input */}
                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block">
                          OTP Verification Code *
                        </Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          maxLength={8}
                          placeholder="••••••••"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                          className="rounded-xl bg-background/80 border-border/60 text-center text-lg font-mono tracking-[0.5em] h-12 focus:border-primary font-bold"
                          autoFocus
                          required
                        />
                      </div>

                      {/* New Password */}
                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block">New Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="Enter new password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                            required
                          />
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block">Confirm New Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="Re-enter new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isResetting}
                        className="w-full rounded-2xl h-12 text-sm font-bold bg-gradient-to-r from-emerald-500 via-teal-600 to-primary hover:opacity-95 text-white shadow-lg btn-shine mt-2"
                      >
                        {isResetting ? "Updating Password..." : "Reset & Save Password"}
                      </Button>

                      {/* Resend & Change Target */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                        <button
                          type="button"
                          onClick={() => setStep("send_otp")}
                          className="hover:text-primary font-medium hover:underline"
                        >
                          Change Email/Mobile
                        </button>
                        <button
                          type="button"
                          disabled={countdown > 0 || isSending}
                          onClick={handleResendOtp}
                          className="text-primary font-semibold hover:underline disabled:opacity-40 disabled:no-underline flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP Code"}
                        </button>
                      </div>
                    </form>

                    <div className="mt-6 text-center">
                      <Link
                        to="/login"
                        className="text-xs font-semibold text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign in
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </Card>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
