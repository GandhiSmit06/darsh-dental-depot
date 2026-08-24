import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { authApi, ApiError } from "@/lib/api";
import { toast } from "sonner";
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Phone,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const passwordLoginSchema = z.object({
  identifier: z.string().min(1, "Please enter your Email or 10-digit Mobile number"),
  password: z.string().min(1, "Password is required"),
});

type PasswordLoginFormData = z.infer<typeof passwordLoginSchema>;

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Doctor & Clinic Login — Darsh Dental Depot" }] }),
  component: LoginPage,
});

/** Map backend role to frontend dashboard route */
function getDashboardRoute(role: string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "shop_owner":
      return "/shop";
    case "doctor":
    default:
      return "/doctor";
  }
}

function LoginPage() {
  const nav = useNavigate();
  const { user, isAuthenticated, login, setSession } = useAuth();
  
  // Login mode: "password" | "otp"
  const [mode, setMode] = useState<"password" | "otp">("password");
  
  // Password Login state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Login state
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [otpStep, setOtpStep] = useState<"enter_id" | "enter_otp">("enter_id");
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = useForm<PasswordLoginFormData>({
    resolver: zodResolver(passwordLoginSchema),
  });

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      nav({ to: getDashboardRoute(user.role) });
    }
  }, [isAuthenticated, user, nav]);

  // Resend countdown timer
  useEffect(() => {
    if (otpStep === "enter_otp" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpStep, countdown]);

  // 1. Password Login Handler
  const onPasswordSubmit = async (data: PasswordLoginFormData) => {
    setIsSubmitting(true);
    try {
      const payload = data.identifier.includes("@")
        ? { email: data.identifier.trim().toLowerCase(), password: data.password }
        : { phone: data.identifier.trim(), password: data.password };

      const user = await login(payload as any);
      toast.success(`Welcome back, ${user.fullName}!`);
      nav({ to: getDashboardRoute(user.role) });
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Invalid email/mobile or password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. OTP Login: Send OTP Code
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = otpIdentifier.trim();
    if (!cleanId) {
      toast.error("Please enter your registered Gmail or 10-digit Mobile number");
      return;
    }

    setOtpSending(true);
    try {
      const res = await authApi.sendLoginOtp({ identifier: cleanId });
      setTargetEmail(res.email || cleanId);
      setOtpStep("enter_otp");
      setCountdown(60);
      toast.success(res.message || "Login OTP sent successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send login OTP. Check if account exists.");
    } finally {
      setOtpSending(false);
    }
  };

  // 3. OTP Login: Verify OTP Code & Auto-Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      toast.error("Please enter the 6-digit OTP code");
      return;
    }

    setOtpVerifying(true);
    try {
      const res = await authApi.verifyLoginOtp({
        identifier: otpIdentifier.trim(),
        otp: otpCode.trim(),
      });

      setSession(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success(`Welcome back, ${res.data.user.fullName}!`);
      nav({ to: getDashboardRoute(res.data.user.role) });
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired OTP code.");
    } finally {
      setOtpVerifying(false);
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
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 sm:p-10 glass-card border border-border/70 rounded-3xl shadow-xl backdrop-blur-xl">
            {/* Header */}
            <div className="text-center mb-6 space-y-1.5">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-sky-600 to-indigo-600 text-white grid place-items-center mb-3 shadow-md">
                <Sparkles className="h-6 w-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-foreground">
                Doctor & Clinic Portal
              </h1>
              <p className="text-xs text-muted-foreground">
                Access your doctor dashboard, wholesale rates & active orders
              </p>
            </div>

            {/* Login Mode Switcher */}
            <div className="flex rounded-2xl bg-secondary/80 p-1 mb-6 border border-border/60">
              <button
                type="button"
                onClick={() => {
                  setMode("password");
                  setOtpStep("enter_id");
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === "password"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                Password Login
              </button>
              <button
                type="button"
                onClick={() => setMode("otp")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === "otp"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <KeyRound className="h-3.5 w-3.5" />
                OTP Login
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === "password" ? (
                /* ── Mode 1: Password Login ── */
                <motion.form
                  key="password-mode"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                  onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                >
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">
                      Email or 10-Digit Mobile
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="dr.patel@gmail.com or 9876543210"
                        className="pl-10 rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                        {...registerPassword("identifier")}
                      />
                    </div>
                    {passwordErrors.identifier && (
                      <p className="text-xs text-destructive mt-1">
                        {passwordErrors.identifier.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                        {...registerPassword("password")}
                      />
                    </div>
                    {passwordErrors.password && (
                      <p className="text-xs text-destructive mt-1">
                        {passwordErrors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-2xl h-11 text-sm font-bold bg-gradient-to-r from-primary via-sky-600 to-indigo-600 hover:opacity-95 text-white shadow-lg btn-shine mt-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Sign In with Password"}{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.form>
              ) : (
                /* ── Mode 2: OTP Login ── */
                <motion.div
                  key="otp-mode"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {otpStep === "enter_id" ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block">
                          Enter Registered Email or Mobile Number
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={otpIdentifier}
                            onChange={(e) => setOtpIdentifier(e.target.value)}
                            placeholder="dr.patel@gmail.com or 9876543210"
                            className="pl-10 rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                            autoFocus
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5">
                          We will send a 6-digit one-time code to your registered email & phone.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full rounded-2xl h-11 text-sm font-bold bg-gradient-to-r from-primary via-sky-600 to-indigo-600 hover:opacity-95 text-white shadow-lg btn-shine mt-2"
                        disabled={otpSending || !otpIdentifier.trim()}
                      >
                        {otpSending ? "Sending OTP..." : "Send Verification Code"}{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  ) : (
                    /* Step 2: Enter OTP */
                    <form onSubmit={handleVerifyOtp} className="space-y-5 text-center">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Enter the 6-digit OTP code sent to:
                        </p>
                        <span className="text-xs font-bold text-foreground bg-secondary px-3 py-1 rounded-full border border-border/60 inline-block">
                          {targetEmail || otpIdentifier}
                        </span>
                      </div>

                      <div>
                        <Input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="••••••"
                          className="text-center text-2xl font-mono tracking-widest h-12 rounded-2xl bg-background/90 border-2 border-primary/40 focus:border-primary shadow-inner font-bold"
                          autoFocus
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full rounded-2xl h-11 text-sm font-bold bg-gradient-to-r from-primary via-sky-600 to-indigo-600 hover:opacity-95 text-white shadow-lg btn-shine"
                        disabled={otpVerifying || otpCode.length < 6}
                      >
                        {otpVerifying ? "Verifying..." : "Verify & Sign In"}
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                      </Button>

                      <div className="pt-2 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => setOtpStep("enter_id")}
                          className="text-muted-foreground hover:text-foreground underline"
                        >
                          Change Number/Email
                        </button>

                        {countdown > 0 ? (
                          <span className="text-muted-foreground">
                            Resend in <strong className="text-primary">{countdown}s</strong>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={otpSending}
                            className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-border/40 text-center space-y-3">
              <p className="text-xs text-muted-foreground">
                New doctor or clinic in Vadodara?{" "}
                <Link
                  to="/register"
                  className="text-primary font-bold hover:underline"
                >
                  Register your clinic
                </Link>
              </p>

              <div className="pt-2">
                <a
                  href="tel:+919727076119"
                  className="text-xs text-primary font-bold hover:underline"
                >
                  Direct Depot Helpline: +91 97270 76119
                </a>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
