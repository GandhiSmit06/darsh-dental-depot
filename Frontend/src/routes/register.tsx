import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
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
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  MapPin,
  Mail,
  KeyRound,
  Loader2,
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

  const [step, setStep] = useState<1 | 2>(1);
  const [pendingEmail, setPendingEmail] = useState("");
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
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="p-6 sm:p-10 rounded-3xl bg-card border border-border/70 dark:border-white/10 shadow-xl">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Vadodara Restriction Notice */}
                  <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 mb-6 flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-primary block">
                        Exclusively For Doctors & Clinics in Vadodara, Gujarat
                      </span>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed text-[11.5px]">
                        This portal is dedicated strictly to dental surgeons with clinics located in Vadodara for same-day local depot fulfillment from Darsh Dental Depot.
                      </p>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="text-center mb-6 space-y-1">
                    <div className="mx-auto h-10 w-10 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-2">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <h1 className="text-2xl font-bold font-heading text-foreground">
                      Doctor Account Registration
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      Access wholesale pricing, same-day delivery, and Tally ERP GST tax invoices
                    </p>
                  </div>

                  <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    {/* Doctor & Clinic Name */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Doctor Full Name *</Label>
                        <Input
                          {...register("fullName")}
                          placeholder="Dr. Rajesh Patel"
                          className="rounded-xl bg-background text-xs h-10 border-border/80"
                        />
                        {errors.fullName && (
                          <p className="text-[11px] text-destructive mt-1 font-semibold">{errors.fullName.message}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Dental Clinic / Hospital Name *</Label>
                        <Input
                          {...register("clinicName")}
                          placeholder="Smile Dental Clinic"
                          className="rounded-xl bg-background text-xs h-10 border-border/80"
                        />
                        {errors.clinicName && (
                          <p className="text-[11px] text-destructive mt-1 font-semibold">{errors.clinicName.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Email / Gmail *</Label>
                        <Input
                          type="email"
                          {...register("email")}
                          placeholder="dr.patel@gmail.com"
                          className="rounded-xl bg-background text-xs h-10 border-border/80"
                        />
                        {errors.email && (
                          <p className="text-[11px] text-destructive mt-1 font-semibold">{errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Mobile Number (10 digits) *</Label>
                        <Input
                          type="tel"
                          {...register("phone")}
                          placeholder="9876543210"
                          maxLength={10}
                          className="rounded-xl bg-background text-xs h-10 border-border/80"
                        />
                        {errors.phone && (
                          <p className="text-[11px] text-destructive mt-1 font-semibold">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Vadodara Locality Dropdown & Pin Code */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Vadodara Clinic Locality *</Label>
                        <Controller
                          control={control}
                          name="vadodaraArea"
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="w-full rounded-xl bg-background text-xs h-10 border-border/80">
                                <SelectValue placeholder="Select Vadodara Area" />
                              </SelectTrigger>
                              <SelectContent className="bg-popover text-xs max-h-52">
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
                          <p className="text-[11px] text-destructive mt-1 font-semibold">{errors.vadodaraArea.message}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Vadodara PIN Code (3900xx) *</Label>
                        <Input
                          {...register("pincode")}
                          placeholder="390001"
                          maxLength={6}
                          className="rounded-xl bg-background text-xs h-10 border-border/80"
                        />
                        {errors.pincode && (
                          <p className="text-[11px] text-destructive mt-1 font-semibold">{errors.pincode.message}</p>
                        )}
                      </div>
                    </div>

                    {/* DCI Number */}
                    <div>
                      <Label className="text-xs font-semibold mb-1 block">
                        Dental Council Registration / License No. *
                      </Label>
                      <Input
                        {...register("medicalRegistrationNumber")}
                        placeholder="e.g. GDC-A-12345 / DCI Registration"
                        className="rounded-xl bg-background text-xs h-10 border-border/80"
                      />
                      {errors.medicalRegistrationNumber && (
                        <p className="text-[11px] text-destructive mt-1 font-semibold">
                          {errors.medicalRegistrationNumber.message}
                        </p>
                      )}
                    </div>

                    {/* Clinic Street Address */}
                    <div>
                      <Label className="text-xs font-semibold mb-1 block">
                        Clinic Street Address (Vadodara) *
                      </Label>
                      <Textarea
                        rows={2}
                        {...register("address")}
                        placeholder="Shop/Flat No., Building Name, Opposite Landmark, Road Name"
                        className="rounded-xl bg-background text-xs border-border/80"
                      />
                      {errors.address && (
                        <p className="text-[11px] text-destructive mt-1 font-semibold">{errors.address.message}</p>
                      )}
                    </div>

                    {/* Passwords */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Password (min 8 chars) *</Label>
                        <Input
                          type="password"
                          {...register("password")}
                          placeholder="••••••••"
                          className="rounded-xl bg-background text-xs h-10 border-border/80"
                        />
                        {errors.password && (
                          <p className="text-[11px] text-destructive mt-1 font-semibold">{errors.password.message}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Confirm Password *</Label>
                        <Input
                          type="password"
                          {...register("confirmPassword")}
                          placeholder="••••••••"
                          className="rounded-xl bg-background text-xs h-10 border-border/80"
                        />
                        {errors.confirmPassword && (
                          <p className="text-[11px] text-destructive mt-1 font-semibold">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full rounded-xl h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-xs mt-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Complete Registration <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </motion.div>
              ) : (
                /* Step 2: OTP Screen */
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 text-center py-4"
                >
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-3">
                    <KeyRound className="h-6 w-6 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-foreground">
                      Verify Your Account
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Verification code sent to <strong>{pendingEmail}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-xs mx-auto mt-4">
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                      placeholder="••••••"
                      className="rounded-xl text-center text-lg tracking-widest font-mono h-11 border-border/80"
                      required
                    />

                    <Button
                      type="submit"
                      disabled={isVerifying}
                      className="w-full rounded-xl h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    >
                      {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Complete Registration"}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center pt-4 mt-4 border-t border-border/50 text-xs text-muted-foreground">
              Already have a clinic account?{" "}
              <Link to="/login" className="font-bold text-primary hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
