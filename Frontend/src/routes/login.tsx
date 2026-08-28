import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
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
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Truck,
  FileText,
  Loader2,
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

  const [mode, setMode] = useState<"password" | "otp">("password");
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

  useEffect(() => {
    if (isAuthenticated && user) {
      nav({ to: getDashboardRoute(user.role) });
    }
  }, [isAuthenticated, user, nav]);

  useEffect(() => {
    if (otpStep === "enter_otp" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpStep, countdown]);

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
      setTargetEmail(res.target || cleanId);
      setOtpStep("enter_otp");
      setCountdown(60);
      toast.success(res.message || "Login OTP sent successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send login OTP. Check if account exists.");
    } finally {
      setOtpSending(false);
    }
  };

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
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Brand Panel */}
          <div className="hidden lg:block lg:col-span-6 space-y-6 pr-6">
            <span className="text-caption-eyebrow text-primary">Vadodara Doctor Network</span>
            <h1 className="text-heading-1 font-extrabold text-foreground tracking-tight leading-tight">
              Access Wholesale Dental Procurement & Tally GST Tax Invoices.
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sign in to manage your clinic's monthly material restocking, live delivery tracking, and downloadable tax invoices.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/70 dark:border-white/8 text-xs">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <div className="font-bold text-foreground">Drug Licensed Depot</div>
                  <div className="text-muted-foreground text-[11px]">DL No. GJ-VAD-215550 & GJ-VAD-215551</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/70 dark:border-white/8 text-xs">
                <Truck className="h-5 w-5 text-sky-500 shrink-0" />
                <div>
                  <div className="font-bold text-foreground">Same-Day Local Dispatch</div>
                  <div className="text-muted-foreground text-[11px]">Direct to clinics across all Vadodara zones</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/70 dark:border-white/8 text-xs">
                <FileText className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <div className="font-bold text-foreground">Tally ERP Tax Invoices</div>
                  <div className="text-muted-foreground text-[11px]">Full GST input tax credit for your practice</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 sm:p-8 rounded-3xl bg-card border border-border/70 dark:border-white/10 shadow-xl"
            >
              {/* Header */}
              <div className="text-center mb-6 space-y-1">
                <div className="mx-auto h-10 w-10 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-2.5">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold font-heading text-foreground">
                  Sign In to Clinic Portal
                </h2>
                <p className="text-xs text-muted-foreground">
                  Enter your credentials to access wholesale pricing
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex rounded-xl bg-secondary/80 dark:bg-white/[0.04] p-1 mb-5 border border-border/60 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMode("password");
                    setOtpStep("enter_id");
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    mode === "password"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" /> Password
                </button>
                <button
                  type="button"
                  onClick={() => setMode("otp")}
                  className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    mode === "otp"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <KeyRound className="h-3.5 w-3.5" /> Instant OTP
                </button>
              </div>

              <AnimatePresence mode="wait">
                {mode === "password" ? (
                  <motion.form
                    key="password-mode"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                    onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                  >
                    <div>
                      <Label className="text-xs font-semibold mb-1 block">Email or 10-Digit Mobile</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="dr.patel@gmail.com or 9876543210"
                          className="pl-10 rounded-xl bg-background text-xs h-10 border-border/80 focus:border-primary"
                          {...registerPassword("identifier")}
                        />
                      </div>
                      {passwordErrors.identifier && (
                        <p className="text-[11px] text-destructive mt-1 font-semibold">
                          {passwordErrors.identifier.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-xs font-semibold">Password</Label>
                        <Link
                          to="/forgot-password"
                          className="text-[11px] font-bold text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 rounded-xl bg-background text-xs h-10 border-border/80 focus:border-primary"
                          {...registerPassword("password")}
                        />
                      </div>
                      {passwordErrors.password && (
                        <p className="text-[11px] text-destructive mt-1 font-semibold">
                          {passwordErrors.password.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-xl h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-xs"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Sign In to Portal <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="otp-mode"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {otpStep === "enter_id" ? (
                      <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                          <Label className="text-xs font-semibold mb-1 block">Registered Email or Mobile</Label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="dr.patel@gmail.com or 9876543210"
                              value={otpIdentifier}
                              onChange={(e) => setOtpIdentifier(e.target.value)}
                              className="pl-10 rounded-xl bg-background text-xs h-10 border-border/80"
                              required
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={otpSending}
                          className="w-full rounded-xl h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-xs"
                        >
                          {otpSending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Login OTP"}
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="p-3 rounded-xl bg-secondary/50 text-xs text-muted-foreground">
                          Enter 6-digit OTP code sent to <strong>{targetEmail}</strong>.
                        </div>

                        <div>
                          <Label className="text-xs font-semibold mb-1 block">6-Digit Verification Code</Label>
                          <Input
                            placeholder="123456"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="rounded-xl text-center text-base tracking-widest font-mono h-10 border-border/80"
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={otpVerifying}
                          className="w-full rounded-xl h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                          {otpVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Sign In"}
                        </Button>

                        <div className="text-center pt-1">
                          <button
                            type="button"
                            onClick={() => setOtpStep("enter_id")}
                            className="text-xs text-muted-foreground hover:text-primary underline font-medium"
                          >
                            Change Email / Mobile Number
                          </button>
                        </div>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Register Link */}
              <div className="text-center pt-5 mt-5 border-t border-border/50 text-xs text-muted-foreground">
                Don't have a verified clinic account yet?{" "}
                <Link to="/register" className="font-bold text-primary hover:underline">
                  Register Clinic
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
