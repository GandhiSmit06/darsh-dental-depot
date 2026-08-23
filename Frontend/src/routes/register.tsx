import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { authApi, ApiError } from "@/lib/api";
import {
  Sparkles,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VADODARA_AREAS = [
  "Alkapuri / RC Dutt Road",
  "Akota / Productivity Road",
  "Gotri / New Alkapuri",
  "Old Padra Road",
  "Karelibaug / Amit Nagar",
  "Manjalpur / Makarpura",
  "Fatehgunj / Sayajigunj",
  "Shiyabaug / Kevdabaug / Mandvi",
  "Waghodia Road / Dabhoi Road",
  "Vasna / Bhayli / TP 13",
  "Nizampura / Sama / Chhani",
  "Subhanpura / Ellora Park",
  "Atladra / Kalali / Sun Pharma Road",
  "Harni / Airport Road",
  "Other Vadodara Locality",
];

const DISPOSABLE_DOMAINS = [
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "throwawaymail.com",
  "trashmail.com",
  "yopmail.com",
  "test.com",
  "example.com",
];

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Doctor full name is required")
      .max(100, "Name must be under 100 characters"),
    clinicName: z.string().min(1, "Dental clinic name is required"),
    vadodaraArea: z.string().min(1, "Please select your Vadodara clinic locality"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .refine((val) => {
        const domain = val.split("@")[1]?.toLowerCase();
        return domain && !DISPOSABLE_DOMAINS.includes(domain);
      }, "Please provide a genuine email address (e.g. Gmail or clinic email)"),
    phone: z
      .string()
      .min(1, "Phone is required")
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, 9)"),
    role: z.literal("doctor"),
    medicalRegistrationNumber: z
      .string()
      .min(1, "DCI / State Dental Council registration number is required"),
    address: z.string().min(1, "Clinic street address in Vadodara is required"),
    pincode: z
      .string()
      .min(6, "Enter 6-digit Vadodara PIN code")
      .max(6, "PIN code must be 6 digits")
      .regex(/^3900\d{2}$/, "Must be a valid Vadodara PIN code (3900xx)"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Must contain uppercase, lowercase, and a number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Vadodara Doctor & Clinic Registration — Darsh Dental Depot" },
      {
        name: "description",
        content:
          "Exclusive portal registration for dental surgeons and clinics practicing in Vadodara, Gujarat.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const { setSession } = useAuth();
  
  // Step state: 1 = Form, 2 = OTP Verification
  const [step, setStep] = useState<1 | 2>(1);
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");
  const [pendingName, setPendingName] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);
  const [lastPayload, setLastPayload] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "doctor",
      pincode: "3900",
    },
  });

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const fullAddress = `${data.address}, ${data.vadodaraArea}, Vadodara, Gujarat - ${data.pincode}`;
      const payload = {
        fullName: data.fullName,
        clinicName: data.clinicName,
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        role: "doctor" as const,
        medicalRegistrationNumber: data.medicalRegistrationNumber,
        address: fullAddress,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };

      await authApi.register(payload);
      
      // Immediately log in with new credentials
      const loginRes = await authApi.login({
        email: payload.email,
        password: payload.password,
      });

      setSession(loginRes.data.user, loginRes.data.accessToken, loginRes.data.refreshToken);
      toast.success(`Welcome to Darsh Dental Depot, Dr. ${payload.fullName}!`);
      nav({ to: "/doctor" });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors && err.errors.length > 0) {
          err.errors.forEach((e) => {
            setError((e.field as any) || "email", { message: e.message });
          });
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Registration failed. Please check your details and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpValue || otpValue.length < 6) {
      toast.error("Please enter the complete 6-digit OTP code");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await authApi.verifyRegisterOtp({
        email: pendingEmail,
        otp: otpValue.trim(),
      });

      setSession(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success(`Welcome to Darsh Dental Depot, Dr. ${res.data.user.fullName}!`);
      nav({ to: "/doctor" });
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || !lastPayload) return;
    setResending(true);
    try {
      const res = await authApi.sendRegisterOtp(lastPayload);
      setCountdown(60);
      toast.success(res.message || "New OTP sent to your email and phone!");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 max-w-2xl relative">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="p-8 sm:p-10 glass-card border border-border/70 rounded-3xl shadow-xl backdrop-blur-xl">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Vadodara Restriction Notice */}
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-6 flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-extrabold text-primary block">
                        📍 Exclusively For Doctors & Clinics in Vadodara, Gujarat
                      </span>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">
                        This portal is dedicated strictly to dental surgeons with clinics located in Vadodara for same-day local depot fulfillment from Darsh Dental Depot.
                      </p>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="text-center mb-8 space-y-1.5">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-sky-600 to-indigo-600 text-white grid place-items-center mb-3 shadow-md">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-foreground">
                      Doctor Account Registration
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      Only genuine Gmail and Indian mobile numbers are accepted for verification
                    </p>
                  </div>

                  <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    {/* Doctor & Clinic Name */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block">Doctor Full Name *</Label>
                        <Input
                          {...register("fullName")}
                          placeholder="Dr. Rajesh Patel"
                          className="rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                        />
                        {errors.fullName && (
                          <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block">Dental Clinic / Hospital Name *</Label>
                        <Input
                          {...register("clinicName")}
                          placeholder="Smile Dental Clinic"
                          className="rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                        />
                        {errors.clinicName && (
                          <p className="text-xs text-destructive mt-1">{errors.clinicName.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block">Genuine Email / Gmail *</Label>
                        <Input
                          type="email"
                          {...register("email")}
                          placeholder="dr.patel@gmail.com"
                          className="rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                        />
                        {errors.email && (
                          <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block">Mobile Number (10 digits) *</Label>
                        <Input
                          type="tel"
                          {...register("phone")}
                          placeholder="9876543210"
                          maxLength={10}
                          className="rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                        />
                        {errors.phone && (
                          <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Vadodara Locality Dropdown & Pin Code */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block">Vadodara Clinic Locality *</Label>
                        <Controller
                          control={control}
                          name="vadodaraArea"
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="w-full rounded-xl bg-background/80 border-border/60 text-sm h-11">
                                <SelectValue placeholder="Select Vadodara Area" />
                              </SelectTrigger>
                              <SelectContent className="glass-card max-h-56">
                                {VADODARA_AREAS.map((area) => (
                                  <SelectItem key={area} value={area} className="text-xs">
                                    {area}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.vadodaraArea && (
                          <p className="text-xs text-destructive mt-1">{errors.vadodaraArea.message}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block">Vadodara PIN Code (3900xx) *</Label>
                        <Input
                          {...register("pincode")}
                          placeholder="390001"
                          maxLength={6}
                          className="rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                        />
                        {errors.pincode && (
                          <p className="text-xs text-destructive mt-1">{errors.pincode.message}</p>
                        )}
                      </div>
                    </div>

                    {/* DCI Number */}
                    <div>
                      <Label className="text-xs font-semibold mb-1.5 block">
                        Dental Council Registration / License No. *
                      </Label>
                      <Input
                        {...register("medicalRegistrationNumber")}
                        placeholder="e.g. GDC-A-12345 / DCI Registration"
                        className="rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                      />
                      {errors.medicalRegistrationNumber && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.medicalRegistrationNumber.message}
                        </p>
                      )}
                    </div>

                    {/* Clinic Street Address */}
                    <div>
                      <Label className="text-xs font-semibold mb-1.5 block">
                        Clinic Street Address (Vadodara) *
                      </Label>
                      <Textarea
                        rows={2}
                        {...register("address")}
                        placeholder="Shop/Flat No., Building Name, Opposite Landmark, Road Name"
                        className="rounded-xl bg-background/80 border-border/60 text-sm focus:border-primary"
                      />
                      {errors.address && (
                        <p className="text-xs text-destructive mt-1">{errors.address.message}</p>
                      )}
                    </div>

                    {/* Passwords */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block">Password (min 8 chars) *</Label>
                        <Input
                          type="password"
                          {...register("password")}
                          placeholder="••••••••"
                          className="rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                        />
                        {errors.password && (
                          <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block">Confirm Password *</Label>
                        <Input
                          type="password"
                          {...register("confirmPassword")}
                          placeholder="••••••••"
                          className="rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                        />
                        {errors.confirmPassword && (
                          <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full rounded-2xl h-12 text-sm font-bold bg-gradient-to-r from-primary via-sky-600 to-indigo-600 hover:opacity-95 text-white shadow-lg btn-shine mt-4"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending Verification Code..." : "Verify & Register Clinic"}{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </motion.div>
              ) : (
                /* Step 2: OTP Verification Screen */
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 text-center py-4"
                >
                  <div className="mx-auto h-16 w-16 rounded-3xl bg-primary/10 text-primary grid place-items-center mb-4 border border-primary/20 shadow-inner">
                    <KeyRound className="h-8 w-8 animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-foreground">
                      Verify Your Account
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                      We have sent a 6-digit verification code to:
                    </p>
                    <div className="inline-flex items-center gap-2 bg-secondary/80 px-4 py-1.5 rounded-full border border-border/60 text-xs font-semibold text-foreground">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                      <span>{pendingEmail}</span>
                    </div>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-6 max-w-sm mx-auto mt-6">
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground block mb-2">
                        Enter 6-Digit OTP Code
                      </Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                        className="text-center text-3xl font-mono tracking-widest h-14 rounded-2xl bg-background/90 border-2 border-primary/40 focus:border-primary shadow-inner font-bold"
                        autoFocus
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full rounded-2xl h-12 text-sm font-bold bg-gradient-to-r from-primary via-sky-600 to-indigo-600 hover:opacity-95 text-white shadow-lg btn-shine"
                      disabled={isVerifying || otpValue.length < 6}
                    >
                      {isVerifying ? "Verifying Code..." : "Verify & Open Doctor Portal"}
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
                  </form>

                  {/* Resend & Back options */}
                  <div className="space-y-3 pt-4 border-t border-border/40">
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <span>Didn't receive the OTP?</span>
                      {countdown > 0 ? (
                        <span className="font-semibold text-primary">Resend in {countdown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={resending}
                          className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          {resending ? "Sending..." : "Resend Code"}
                        </button>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        ← Edit Registration Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-border/40 text-center space-y-3">
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-bold hover:underline">
                  Sign in to Doctor Portal
                </Link>
              </p>

              <div className="p-3 rounded-2xl bg-secondary/50 border border-border/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Need direct phone assistance?</span>
                </div>
                <a
                  href="tel:+919727076119"
                  className="font-extrabold text-primary hover:underline"
                >
                  +91 97270 76119
                </a>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
