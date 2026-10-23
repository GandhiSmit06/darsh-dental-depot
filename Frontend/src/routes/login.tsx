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
import { supabase } from "@/lib/supabase";
import { CodeSlots } from "@/components/ui/CodeSlots";
import { GridDistortion } from "@/components/ui/GridDistortion";
import { toast } from "sonner";
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Phone,
  MessageCircle,
  Building2,
  Clock,
  ShieldCheck,
  Award,
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

  // Mode: "otp" (default like Dentalkart) | "password"
  const [mode, setMode] = useState<"otp" | "password">("otp");

  // Input Type for OTP: "mobile" | "email"
  const [inputType, setInputType] = useState<"mobile" | "email">("mobile");

  // Password Login state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Login state
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [targetDisplay, setTargetDisplay] = useState("");
  const [otpStep, setOtpStep] = useState<"enter_id" | "enter_otp">("enter_id");
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpStatus, setOtpStatus] = useState<"idle" | "error" | "success">("idle");
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
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = otpIdentifier.trim();
    if (!cleanId) {
      toast.error(inputType === "mobile" ? "Please enter your 10-digit mobile number" : "Please enter your registered email address");
      return;
    }

    setOtpSending(true);
    try {
      const res = await authApi.sendLoginOtp({ identifier: cleanId });
      setTargetDisplay(res.target || cleanId);
      setOtpStep("enter_otp");
      setCountdown(60);
      setOtpStatus("idle");

      if (res.otp) {
        setGeneratedOtp(res.otp);
        setOtpCode(res.otp);
        toast.success(`Login OTP: ${res.otp}`, {
          duration: 10000,
          description: "Use this 6-digit code to access your doctor account.",
        });
      } else {
        setGeneratedOtp(null);
        setOtpCode("");
        toast.success(res.message || "Login OTP sent successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send login OTP. Check if account exists.");
    } finally {
      setOtpSending(false);
    }
  };

  // 3. OTP Login: Verify OTP Code & Auto-Login
  const handleVerifyOtp = async (e?: React.FormEvent, customOtp?: string) => {
    if (e) e.preventDefault();
    const code = (customOtp || otpCode).trim();
    if (!code || code.length < 6) {
      toast.error("Please enter the 6-digit OTP code");
      return;
    }

    setOtpVerifying(true);
    try {
      const res = await authApi.verifyLoginOtp({
        identifier: otpIdentifier.trim(),
        otp: code,
      });

      setOtpStatus("success");
      setSession(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success(`Welcome back, ${res.data.user.fullName}!`);
      setTimeout(() => {
        nav({ to: getDashboardRoute(res.data.user.role) });
      }, 700);
    } catch (err: any) {
      setOtpStatus("error");
      toast.error(err.message || "Invalid or expired OTP code.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // 4. Google OAuth Login
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
        },
      });
      if (error) toast.error(error.message);
    } catch (err: any) {
      toast.error("Google authentication failed. Please use OTP or Password.");
    }
  };

  return (
    <PublicLayout hideAnnouncementBar={true} hideFooter={true}>
      <div className="relative min-h-[calc(100vh-68px)] w-full overflow-hidden flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        {/* ── Background WebGL2 Grid Distortion Effect (Original High-Res Quality) ── */}
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <GridDistortion
            imageSrc="/design-assets/auth-bg.jpg"
            grid={18}
            radius={0.2}
            strength={0.16}
            relaxation={0.96}
            mode="drag"
            softness={0.15}
            chroma={0.06}
            idle={0.25}
            clickRipple={true}
            intro={true}
            className="w-full h-full"
          />
          {/* Gentle contrast gradient ensuring the dentist image and clinic are crystal clear */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/25 to-slate-950/55 dark:from-black/75 dark:via-black/25 dark:to-black/60 pointer-events-none" />
        </div>

        {/* ── Main Container: Dentalkart Split Layout ── */}
        <div className="container mx-auto max-w-6xl relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (Desktop): Brand statement & Trust Badges */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-6 text-white pr-4 select-none">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300 w-fit">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Vadodara's Official Dental Procurement Depot</span>
            </div>

            {/* Big Headline */}
            <h1 className="text-4xl xl:text-5xl font-black font-heading tracking-tight leading-[1.15] text-white drop-shadow-md">
              Join <span className="text-[#3FD1B3]">1,000+ Indian Dentists</span> Who Trust Darsh Dental Depot To Grow Their Practice
            </h1>

            <p className="text-slate-200 text-base max-w-xl leading-relaxed drop-shadow-sm">
              Direct clinic procurement for registered dentists, oral surgeons, and clinics across Vadodara and Gujarat. Authentic materials, verified batch numbers, and same-day delivery.
            </p>

            {/* 4 Trust Checkpoints (Dentalkart style) */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-100 bg-black/25 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <Clock className="h-5 w-5 text-[#3FD1B3] shrink-0" />
                <span>2-Hour Vadodara Clinic Delivery</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-100 bg-black/25 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <ShieldCheck className="h-5 w-5 text-[#3FD1B3] shrink-0" />
                <span>100% Genuine 3M, GC & Mani</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-100 bg-black/25 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <Award className="h-5 w-5 text-[#3FD1B3] shrink-0" />
                <span>Wholesale Rates for Doctors</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-100 bg-black/25 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <Building2 className="h-5 w-5 text-[#3FD1B3] shrink-0" />
                <span>Physical Shiyabaug Depot</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Auth Modal Card (Dentalkart Style) */}
          <div className="w-full lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-md"
            >
              <Card className="p-7 sm:p-9 bg-white dark:bg-[#0B1210] border border-slate-200/90 dark:border-white/10 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-xl">
                {/* Brand Logo Header */}
                <div className="text-center mb-6 space-y-1">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#12A488] text-white grid place-items-center shadow-md">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <span className="font-heading font-black text-xl text-slate-900 dark:text-white tracking-tight">
                      Darsh Dental Depot
                    </span>
                  </div>
                  <h2 className="text-2xl font-black font-heading tracking-tight text-slate-900 dark:text-white">
                    Log In or Sign up
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sign up now and get exclusive wholesale rates & express clinic dispatch
                  </p>
                </div>

                {/* Sub-Tabs / Mode Switches */}
                <div className="flex items-center justify-between pb-4 mb-2 text-xs font-semibold border-b border-slate-100 dark:border-white/5">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("otp");
                        setOtpStep("enter_id");
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        mode === "otp"
                          ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                      }`}
                    >
                      OTP Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("password")}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        mode === "password"
                          ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                      }`}
                    >
                      Use Password
                    </button>
                  </div>

                  {mode === "otp" && otpStep === "enter_id" && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputType(inputType === "mobile" ? "email" : "mobile");
                        setOtpIdentifier("");
                      }}
                      className="text-[#0284c7] dark:text-[#3FD1B3] hover:underline"
                    >
                      {inputType === "mobile" ? "Login with Email" : "Use Mobile Number"}
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {mode === "otp" ? (
                    /* ── Mode 1: OTP Login (Dentalkart Style) ── */
                    <motion.div
                      key="otp-step-view"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      {otpStep === "enter_id" ? (
                        <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
                          <div>
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                              {inputType === "mobile" ? "Mobile Number" : "Email Address"}
                            </Label>

                            {inputType === "mobile" ? (
                              <div className="flex rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden focus-within:border-[#12A488] focus-within:ring-2 focus-within:ring-[#12A488]/20 transition-all">
                                <span className="bg-slate-50 dark:bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-white/10 flex items-center gap-1.5">
                                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                                  +91
                                </span>
                                <Input
                                  type="tel"
                                  maxLength={10}
                                  placeholder="98765 43210"
                                  value={otpIdentifier}
                                  onChange={(e) => setOtpIdentifier(e.target.value.replace(/\D/g, ""))}
                                  className="border-0 shadow-none focus-visible:ring-0 rounded-none h-11 text-sm font-medium"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                  type="email"
                                  placeholder="doctor@clinic.com"
                                  value={otpIdentifier}
                                  onChange={(e) => setOtpIdentifier(e.target.value)}
                                  className="pl-10 rounded-xl h-11 text-sm border-slate-200 dark:border-white/10 focus:border-[#12A488]"
                                  autoFocus
                                />
                              </div>
                            )}

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                              {inputType === "mobile"
                                ? "We'll send a 6-digit verification code to your phone."
                                : "We'll send a 6-digit one-time code to your registered email."}
                            </p>
                            <div id="recaptcha-container"></div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full rounded-xl h-11 text-sm font-bold bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#12A488] dark:hover:bg-[#3FD1B3] text-white dark:text-[#04110E] shadow-md transition-all flex items-center justify-center gap-2"
                            disabled={otpSending || !otpIdentifier.trim()}
                          >
                            {otpSending ? "Sending OTP..." : "Send OTP"}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </form>
                      ) : (
                        /* Step 2: Enter OTP */
                        <form onSubmit={(e) => handleVerifyOtp(e)} className="space-y-4 pt-2 text-center">
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Enter the 6-digit code sent to:
                            </p>
                            <span className="text-xs font-bold text-slate-800 dark:text-[#3FD1B3] bg-slate-100 dark:bg-white/10 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 inline-block">
                              {targetDisplay || otpIdentifier}
                            </span>
                          </div>

                          {/* Helper banner if local verification code was generated */}
                          {generatedOtp && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between"
                            >
                              <span>
                                Clinic Code: <strong className="font-mono tracking-widest text-sm text-emerald-700 dark:text-emerald-200">{generatedOtp}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => setOtpCode(generatedOtp)}
                                className="text-[11px] font-bold underline hover:text-emerald-900 dark:hover:text-white"
                              >
                                Auto-fill
                              </button>
                            </motion.div>
                          )}

                          <div className="py-2 flex justify-center w-full">
                            <CodeSlots
                              length={6}
                              value={otpCode}
                              status={otpStatus}
                              onChange={(code) => {
                                setOtpCode(code);
                                if (otpStatus !== "idle") setOtpStatus("idle");
                              }}
                              onComplete={(code) => {
                                handleVerifyOtp(undefined, code);
                              }}
                              disabled={otpVerifying}
                              autoFocus
                              slotSize={44}
                              gap={6}
                              radius={12}
                            />
                          </div>

                          <Button
                            type="submit"
                            className="w-full rounded-xl h-11 text-sm font-bold bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#12A488] dark:hover:bg-[#3FD1B3] text-white dark:text-[#04110E] shadow-md transition-all flex items-center justify-center gap-2"
                            disabled={otpVerifying || otpCode.length < 6}
                          >
                            {otpVerifying ? "Verifying..." : "Verify OTP & Continue"}
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>

                          <div className="flex items-center justify-between text-xs pt-1">
                            <button
                              type="button"
                              onClick={() => setOtpStep("enter_id")}
                              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white underline"
                            >
                              Change {inputType === "mobile" ? "Number" : "Email"}
                            </button>

                            {countdown > 0 ? (
                              <span className="text-slate-400">
                                Resend in <strong className="text-slate-700 dark:text-slate-200">{countdown}s</strong>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSendOtp()}
                                disabled={otpSending}
                                className="font-bold text-[#0284c7] dark:text-[#3FD1B3] hover:underline inline-flex items-center gap-1"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Resend OTP
                              </button>
                            )}
                          </div>
                        </form>
                      )}
                    </motion.div>
                  ) : (
                    /* ── Mode 2: Password Login ── */
                    <motion.form
                      key="password-step-view"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 pt-2"
                      onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                    >
                      <div>
                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                          Email or 10-Digit Mobile
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="doctor@clinic.com or 9876543210"
                            className="pl-10 rounded-xl h-11 text-sm border-slate-200 dark:border-white/10 focus:border-[#12A488]"
                            {...registerPassword("identifier")}
                          />
                        </div>
                        {passwordErrors.identifier && (
                          <p className="text-xs text-red-500 mt-1">{passwordErrors.identifier.message}</p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</Label>
                          <Link to="/forgot-password" className="text-[11px] text-[#0284c7] dark:text-[#3FD1B3] font-semibold hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 rounded-xl h-11 text-sm border-slate-200 dark:border-white/10 focus:border-[#12A488]"
                            {...registerPassword("password")}
                          />
                        </div>
                        {passwordErrors.password && (
                          <p className="text-xs text-red-500 mt-1">{passwordErrors.password.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full rounded-xl h-11 text-sm font-bold bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#12A488] dark:hover:bg-[#3FD1B3] text-white dark:text-[#04110E] shadow-md transition-all flex items-center justify-center gap-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Signing In..." : "Sign In with Password"}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                    <span className="bg-white dark:bg-[#0B1210] px-3 text-slate-400 font-semibold">Or</span>
                  </div>
                </div>

                {/* Google Sign In (Dentalkart Style) */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-xs"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Continue with Google
                </button>

                {/* WhatsApp & Register Links */}
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 text-center space-y-2.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Need help?{" "}
                    <a
                      href="https://wa.me/919727076119?text=Hello%20Darsh%20Dental%20Depot,%20I%20need%20help%20with%20clinic%20login"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Connect on WhatsApp
                    </a>
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    New doctor or clinic in Vadodara?{" "}
                    <Link to="/register" className="text-[#0284c7] dark:text-[#3FD1B3] font-bold hover:underline">
                      Register your clinic
                    </Link>
                  </p>

                  <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                    By logging or signing up, you agree to our{" "}
                    <Link to="/about" className="underline hover:text-slate-600">Terms</Link> &{" "}
                    <Link to="/about" className="underline hover:text-slate-600">Privacy Policy</Link>
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
