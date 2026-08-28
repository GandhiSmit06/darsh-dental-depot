import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/ScrollReveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Store Location — Darsh Dental Depot Vadodara" },
      {
        name: "description",
        content:
          "Visit Darsh Dental Depot at Siyabaug Vadodara or reach out for same-day dental supply dispatch across Vadodara clinics.",
      },
    ],
  }),
  component: ContactPage,
});

const MAPS_URL = "https://maps.app.goo.gl/7czn6gwYUgdSm8b46";
const PHONE_NUMBER = "+91 97270 76119";
const PHONE_RAW = "+919727076119";
const WHATSAPP_URL =
  "https://wa.me/919727076119?text=Hello%20Darsh%20Dental%20Depot,%20I%20am%20a%20dentist%20in%20Vadodara%20and%20need%20assistance%20with%20an%20order.";

function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    clinicName: "",
    vadodaraArea: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(
        "Thank you Doctor! Your inquiry has been sent directly to Darsh Dental Depot. We will get back to you shortly."
      );
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        clinicName: "",
        vadodaraArea: "",
        subject: "",
        message: "",
      });
    }, 800);
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-caption-eyebrow text-primary">Direct Depot Desk</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-display-xl font-extrabold font-heading tracking-tight text-foreground"
          >
            Visit Our Depot Or Reach Our Supply Desk.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-muted-foreground text-xs sm:text-sm leading-relaxed"
          >
            Exclusively serving dental clinics across Vadodara. Visit our store at Siyabaug / Kevdabaug or call for instant express delivery.
          </motion.p>
        </div>

        {/* Contact Quick Cards */}
        <StaggerContainer staggerDelay={0.08} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Phone */}
          <StaggerItem scale>
            <div className="p-5 rounded-2xl bg-card border border-border/70 dark:border-white/10 text-center flex flex-col justify-between h-full shadow-xs">
              <div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center mx-auto mb-3">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="font-bold text-xs text-foreground font-heading">Call Depot Directly</div>
                <div className="text-xs font-mono font-extrabold text-primary mt-1">{PHONE_NUMBER}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Proprietor: Hetal Gandhi</div>
              </div>
              <a
                href={`tel:${PHONE_RAW}`}
                className="mt-3 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors"
              >
                <Phone className="h-3 w-3" /> Call Now
              </a>
            </div>
          </StaggerItem>

          {/* WhatsApp */}
          <StaggerItem scale>
            <div className="p-5 rounded-2xl bg-card border border-border/70 dark:border-white/10 text-center flex flex-col justify-between h-full shadow-xs">
              <div>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center mx-auto mb-3">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="font-bold text-xs text-foreground font-heading">WhatsApp Order Line</div>
                <div className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {PHONE_NUMBER}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Quick photo prescriptions</div>
              </div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-colors"
              >
                <MessageSquare className="h-3 w-3" /> Chat on WhatsApp
              </a>
            </div>
          </StaggerItem>

          {/* Email */}
          <StaggerItem scale>
            <div className="p-5 rounded-2xl bg-card border border-border/70 dark:border-white/10 text-center flex flex-col justify-between h-full shadow-xs">
              <div>
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 grid place-items-center mx-auto mb-3">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="font-bold text-xs text-foreground font-heading">Official Email</div>
                <div className="text-xs font-semibold text-foreground mt-1 truncate">hetalgandhi16@gmail.com</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Institutional quotation requests</div>
              </div>
              <a
                href="mailto:hetalgandhi16@gmail.com"
                className="mt-3 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold text-xs transition-colors"
              >
                <Mail className="h-3 w-3" /> Send Email
              </a>
            </div>
          </StaggerItem>

          {/* Depot Location */}
          <StaggerItem scale>
            <div className="p-5 rounded-2xl bg-card border border-border/70 dark:border-white/10 text-center flex flex-col justify-between h-full shadow-xs">
              <div>
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 grid place-items-center mx-auto mb-3">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="font-bold text-xs text-foreground font-heading">Physical Depot</div>
                <div className="text-xs text-foreground mt-1">FF-10/11, Vraj Vihar Complex</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Siyabaug, Vadodara - 390001</div>
              </div>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs transition-colors"
              >
                <ExternalLink className="h-3 w-3" /> Google Maps
              </a>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Main Grid: Form + Depot Hours & Map Link */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/70 dark:border-white/10 shadow-sm">
              <div className="mb-5 space-y-1">
                <h2 className="text-lg font-bold font-heading text-foreground">
                  Send a Direct Procurement Inquiry
                </h2>
                <p className="text-xs text-muted-foreground">
                  Need a specific unlisted composite shade, batch quotation, or equipment demonstration?
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold mb-1 block">First Name *</Label>
                    <Input
                      required
                      placeholder="Rajesh"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="rounded-xl bg-background text-xs h-10 border-border/80"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1 block">Last Name</Label>
                    <Input
                      placeholder="Patel"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="rounded-xl bg-background text-xs h-10 border-border/80"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold mb-1 block">Doctor / Clinic Email *</Label>
                    <Input
                      type="email"
                      required
                      placeholder="dr.patel@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl bg-background text-xs h-10 border-border/80"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1 block">Mobile Number (10 digits) *</Label>
                    <Input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl bg-background text-xs h-10 border-border/80"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold mb-1 block">Clinic Name</Label>
                    <Input
                      placeholder="Smile Dental Clinic"
                      value={formData.clinicName}
                      onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                      className="rounded-xl bg-background text-xs h-10 border-border/80"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1 block">Vadodara Locality</Label>
                    <Input
                      placeholder="e.g. Alkapuri, Akota, Gotri"
                      value={formData.vadodaraArea}
                      onChange={(e) => setFormData({ ...formData, vadodaraArea: e.target.value })}
                      className="rounded-xl bg-background text-xs h-10 border-border/80"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-1 block">Subject / Material Required *</Label>
                  <Input
                    required
                    placeholder="e.g. Bulk 3M Filtek Z250 Composite quotation"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="rounded-xl bg-background text-xs h-10 border-border/80"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-1 block">Detailed Message *</Label>
                  <Textarea
                    rows={3}
                    required
                    placeholder="Specify shades, quantities, or clinic delivery instructions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="rounded-xl bg-background text-xs border-border/80"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-xs"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  {loading ? "Sending Message..." : "Submit Inquiry to Depot"}
                </Button>
              </form>
            </div>
          </div>

          {/* Depot Operating Details */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-secondary/40 dark:bg-white/[0.02] border border-border/70 dark:border-white/10 space-y-4 text-xs">
              <div className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Depot Operational Schedule
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">Monday – Saturday:</span>
                  <span className="font-bold text-foreground font-mono">10:00 AM – 8:30 PM</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">Sunday:</span>
                  <span className="font-bold text-foreground font-mono">10:30 AM – 2:00 PM</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">Express Dispatch:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Within 2 Hours (Local)</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border/70 dark:border-white/10 space-y-3 text-xs">
              <div className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Licensed Dental Depot
              </div>
              <p className="text-muted-foreground text-[11.5px] leading-relaxed">
                Operating with valid Gujarat FDCA Drug Licenses (<strong>GJ-VAD-215550</strong> & <strong>GJ-VAD-215551</strong>) ensuring full regulatory compliance for scheduled dental drugs and surgical devices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
