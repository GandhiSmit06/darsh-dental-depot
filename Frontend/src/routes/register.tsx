import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { Sparkles, ShieldCheck, UserCheck, Stethoscope, Store, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const registerSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required").max(100, "Name must be under 100 characters"),
    clinicName: z.string().min(1, "Clinic name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    phone: z
      .string()
      .min(1, "Phone is required")
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),
    role: z.enum(["doctor", "shop_owner"], {
      required_error: "Please select a role",
    }),
    medicalRegistrationNumber: z.string().min(1, "Medical registration number is required"),
    address: z.string().min(1, "Address is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Must contain uppercase, lowercase, and a number",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Doctor & Clinic Registration — Darsh Dental Depot" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const { register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "doctor",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const message = await registerUser(data);
      toast.success(message);
      nav({ to: "/login" });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors && err.errors.length > 0) {
          const validFields: Array<keyof RegisterFormData> = [
            "fullName",
            "clinicName",
            "email",
            "phone",
            "role",
            "medicalRegistrationNumber",
            "address",
            "password",
            "confirmPassword",
          ];
          err.errors.forEach((e) => {
            const field = e.field as keyof RegisterFormData;
            if (validFields.includes(field)) {
              setError(field, { message: e.message });
            }
          });
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 max-w-2xl relative">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="p-8 sm:p-10 glass-card border border-border/70 rounded-3xl shadow-xl backdrop-blur-xl">
            {/* Header */}
            <div className="text-center mb-8 space-y-2">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-sky-600 to-indigo-600 text-white grid place-items-center mb-3 shadow-md">
                <Sparkles className="h-6 w-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-foreground">
                Register Your Practice
              </h1>
              <p className="text-xs text-muted-foreground">
                Join 5,000+ certified dental practitioners across India unlocking wholesale pricing
              </p>
            </div>

            {/* Role Switcher Pill */}
            <div className="mb-6">
              <Label className="text-xs font-semibold mb-2 block text-muted-foreground uppercase tracking-wider">
                Select Account Type
              </Label>
              <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-secondary/60 border border-border/50">
                <button
                  type="button"
                  onClick={() => setValue("role", "doctor")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    selectedRole === "doctor"
                      ? "bg-background text-primary shadow-sm border border-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Stethoscope className="h-4 w-4" /> Doctor / Clinic
                </button>

                <button
                  type="button"
                  onClick={() => setValue("role", "shop_owner")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    selectedRole === "shop_owner"
                      ? "bg-background text-primary shadow-sm border border-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Store className="h-4 w-4" /> Dental Shop Owner
                </button>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Full Name *</Label>
                  <Input
                    {...register("fullName")}
                    placeholder="Dr. John Doe"
                    className="rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Clinic / Store Name *</Label>
                  <Input
                    {...register("clinicName")}
                    placeholder="SmileCare Dental Center"
                    className="rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                  />
                  {errors.clinicName && (
                    <p className="text-xs text-destructive mt-1">{errors.clinicName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Email Address *</Label>
                  <Input
                    type="email"
                    {...register("email")}
                    placeholder="doctor@example.com"
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
                    className="rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1.5 block">
                  Dental Registration / License Number *
                </Label>
                <Input
                  {...register("medicalRegistrationNumber")}
                  placeholder="e.g. GDC-12345 / DCI Registration"
                  className="rounded-xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                />
                {errors.medicalRegistrationNumber && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.medicalRegistrationNumber.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Clinic Delivery Address *</Label>
                <Textarea
                  rows={2}
                  {...register("address")}
                  placeholder="Complete clinical address with city & PIN code"
                  className="rounded-xl bg-background/80 border-border/60 text-sm focus:border-primary"
                />
                {errors.address && (
                  <p className="text-xs text-destructive mt-1">{errors.address.message}</p>
                )}
              </div>

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
                {isSubmitting ? "Creating Account..." : "Complete Clinic Registration"}{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/40 text-center space-y-3">
              <p className="text-xs text-muted-foreground">
                Already registered with us?{" "}
                <Link to="/login" className="text-primary font-bold hover:underline">
                  Sign in to portal
                </Link>
              </p>

              <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Encrypted Data • Instant Verification For Practicing Doctors</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
