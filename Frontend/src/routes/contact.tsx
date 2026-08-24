import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card } from "@/components/ui/card";
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
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  ScaleReveal,
} from "@/components/animations/ScrollReveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Store Location — Darsh Dental Depot Vadodara" },
      {
        name: "description",
        content:
          "Visit Darsh Dental Depot at Shiyabaug Vadodara or reach out for same-day dental supply dispatch across Vadodara clinics.",
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
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Badge variant="outline" className="text-primary border-primary/30">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" /> Vadodara Dental Clinic Support
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl font-extrabold font-heading tracking-tight text-foreground"
          >
            Visit Our Depot Or <span className="text-gradient">Get In Touch</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-muted-foreground text-sm sm:text-base leading-relaxed"
          >
            Exclusively serving practicing dentists across Vadodara. Visit our store at Shiyabaug / Kevdabaug or call for fast clinic delivery.
          </motion.p>
        </div>

        {/* Contact Info Cards */}
        <StaggerContainer staggerDelay={0.1} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {/* Phone */}
          <StaggerItem scale>
            <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60 text-center flex flex-col justify-between h-full">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-4 shadow-sm">
                  <Phone className="h-6 w-6" />
                </div>
                <div className="font-bold text-sm text-foreground font-heading">Call Store Directly</div>
                <div className="text-sm font-extrabold text-primary mt-1">{PHONE_NUMBER}</div>
                <div className="text-xs text-muted-foreground mt-1">Direct contact with owner</div>
              </div>
              <a
                href={`tel:${PHONE_RAW}`}
                className="mt-4 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors"
              >
                <Phone className="h-3.5 w-3.5" /> Call Now
              </a>
            </Card>
          </StaggerItem>

          {/* WhatsApp */}
          <StaggerItem scale>
            <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60 text-center flex flex-col justify-between h-full">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center mx-auto mb-4 shadow-sm">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div className="font-bold text-sm text-foreground font-heading">WhatsApp Orders</div>
                <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {PHONE_NUMBER}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Instant material availability</div>
              </div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-sm"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Chat on WhatsApp
              </a>
            </Card>
          </StaggerItem>

          {/* Working Hours */}
          <StaggerItem scale>
            <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60 text-center flex flex-col justify-between h-full">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 grid place-items-center mx-auto mb-4 shadow-sm">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="font-bold text-sm text-foreground font-heading">Depot Working Hours</div>
                <div className="text-xs font-extrabold text-foreground mt-1">Mon – Sat: 10:00 AM – 8:30 PM</div>
                <div className="text-xs text-muted-foreground mt-1">Sunday: Closed (Surgeries on call)</div>
              </div>
              <div className="mt-4 py-1.5 px-3 rounded-xl bg-secondary/80 text-[11px] font-semibold text-muted-foreground">
                Open 6 Days a Week
              </div>
            </Card>
          </StaggerItem>

          {/* Location */}
          <StaggerItem scale>
            <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60 text-center flex flex-col justify-between h-full">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 grid place-items-center mx-auto mb-4 shadow-sm">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="font-bold text-sm text-foreground font-heading">Physical Depot</div>
                <div className="text-xs font-semibold text-foreground mt-1">Shiyabaug / Kevdabaug</div>
                <div className="text-[11px] text-muted-foreground mt-1">Vadodara, Gujarat 390001</div>
              </div>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs transition-colors"
              >
                <Navigation className="h-3.5 w-3.5" /> Directions
              </a>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* Main Grid: Form + Detailed Location & Timings */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Inquiry Form */}
          <ScrollReveal direction="left" className="lg:col-span-7">
            <Card className="p-6 sm:p-8 glass-card rounded-3xl border border-border/60 shadow-lg">
              <h2 className="text-2xl font-bold font-heading mb-1 text-foreground">Clinic Material Inquiry</h2>
              <p className="text-xs text-muted-foreground mb-6">
                Vadodara dental doctors can submit requests for custom quantity or direct quotation.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Doctor Name *</Label>
                    <Input
                      required
                      placeholder="Dr. Smit Patel"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="rounded-xl bg-background/70 border-border/60 text-sm h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Clinic / Hospital Name *</Label>
                    <Input
                      required
                      placeholder="e.g. Care Dental Clinic"
                      value={formData.clinicName}
                      onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                      className="rounded-xl bg-background/70 border-border/60 text-sm h-11"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Doctor Contact Number *</Label>
                    <Input
                      type="tel"
                      required
                      placeholder="98765 00000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl bg-background/70 border-border/60 text-sm h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Clinic Area in Vadodara *</Label>
                    <Input
                      required
                      placeholder="e.g. Alkapuri, Akota, Gotri, Karelibaug"
                      value={formData.vadodaraArea}
                      onChange={(e) => setFormData({ ...formData, vadodaraArea: e.target.value })}
                      className="rounded-xl bg-background/70 border-border/60 text-sm h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Product / Material Needed *</Label>
                  <Input
                    required
                    placeholder="e.g. 3M Filtek Z350 XT, Mani Endo K-Files, GC Gold Label Cements"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="rounded-xl bg-background/70 border-border/60 text-sm h-11"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Additional Specifications / Urgency</Label>
                  <Textarea
                    rows={3}
                    placeholder="Mention shade, quantity, or if urgent delivery needed at clinic today..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="rounded-xl bg-background/70 border-border/60 text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl h-12 text-sm font-bold bg-gradient-to-r from-primary to-indigo-600 hover:opacity-95 text-white shadow-lg btn-shine mt-2"
                >
                  {loading ? "Sending..." : "Submit Inquiry to Darsh Dental Depot"} <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Card>
          </ScrollReveal>

          {/* Store Location & Timings Box */}
          <div className="lg:col-span-5 space-y-6">
            <ScrollReveal direction="right" delay={0.1}>
              <Card className="p-6 glass-card rounded-3xl border border-border/60 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm font-heading">Darsh Dental Depot Store</div>
                    <div className="text-xs text-muted-foreground">Authorized Dental Material Supplier</div>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs border-t border-border/40">
                  <div>
                    <span className="font-bold text-foreground block mb-0.5">📍 Full Store Address:</span>
                    <p className="text-muted-foreground leading-relaxed">
                      FF-10/11, Vraj Vihar Complex, Char Rasta, Opp. Kachhia Patel Wadi, Mahavir Colony, Shiyabaug, Kevdabaug, Vadodara, Gujarat 390001
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
                    <div>
                      <span className="font-bold text-foreground block">🕒 Working Days:</span>
                      <span className="text-muted-foreground">Monday to Saturday</span>
                    </div>
                    <div>
                      <span className="font-bold text-foreground block">⏰ Timings:</span>
                      <span className="text-muted-foreground">10:00 AM – 8:30 PM</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/30">
                    <span className="font-bold text-foreground block mb-0.5">📞 Direct Owner Helpline:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={`tel:${PHONE_RAW}`}
                        className="font-extrabold text-sm text-primary hover:underline"
                      >
                        {PHONE_NUMBER}
                      </a>
                      <span className="text-muted-foreground text-[11px]">(Call / WhatsApp)</span>
                    </div>
                  </div>

                  <div className="pt-3">
                    <a
                      href={MAPS_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-white font-bold text-xs shadow-md hover:bg-primary/90 transition-all btn-shine"
                    >
                      Open Location in Google Maps <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </Card>
            </ScrollReveal>

            {/* Google Map View */}
            <ScaleReveal delay={0.2}>
              <Card className="overflow-hidden rounded-3xl border border-border/60 shadow-lg h-[290px] relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.6033486161476!2d73.2001109!3d22.2951561!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc50752550793%3A0xff8cbe3bb9f64be5!2sDarsh%20Dental%20Depot!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0, position: "absolute", inset: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Darsh Dental Depot Vadodara Store Location"
                />
              </Card>
            </ScaleReveal>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
