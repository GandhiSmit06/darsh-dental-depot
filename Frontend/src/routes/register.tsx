import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

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
  head: () => ({ meta: [{ title: "Register — Darsh Dental Depot" }] }),
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
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "doctor",
    },
  });

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
            "fullName", "clinicName", "email", "phone", "role",
            "medicalRegistrationNumber", "address", "password", "confirmPassword",
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
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Join 5,000+ trusted dental professionals
            </p>
          </div>
          <form
            className="grid sm:grid-cols-2 gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <Label className="mb-1.5">Full name</Label>
              <Input {...register("fullName")} placeholder="Dr. John Doe" />
              {errors.fullName && (
                <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>
              )}
            </div>
            <div>
              <Label className="mb-1.5">Clinic name</Label>
              <Input {...register("clinicName")} placeholder="SmileCare Clinic" />
              {errors.clinicName && (
                <p className="text-xs text-destructive mt-1">{errors.clinicName.message}</p>
              )}
            </div>
            <div>
              <Label className="mb-1.5">Email</Label>
              <Input type="email" {...register("email")} placeholder="doctor@example.com" />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label className="mb-1.5">Phone</Label>
              <Input type="tel" {...register("phone")} placeholder="9876543210" />
              {errors.phone && (
                <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5">I am a</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="shop_owner">Shop Owner</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-xs text-destructive mt-1">{errors.role.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5">Medical registration number</Label>
              <Input {...register("medicalRegistrationNumber")} placeholder="MCI-12345" />
              {errors.medicalRegistrationNumber && (
                <p className="text-xs text-destructive mt-1">
                  {errors.medicalRegistrationNumber.message}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5">Address</Label>
              <Textarea rows={2} {...register("address")} placeholder="Clinic address" />
              {errors.address && (
                <p className="text-xs text-destructive mt-1">{errors.address.message}</p>
              )}
            </div>
            <div>
              <Label className="mb-1.5">Password</Label>
              <Input type="password" {...register("password")} placeholder="••••••••" />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>
            <div>
              <Label className="mb-1.5">Confirm password</Label>
              <Input type="password" {...register("confirmPassword")} placeholder="••••••••" />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </div>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </PublicLayout>
  );
}
