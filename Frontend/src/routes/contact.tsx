import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Clinic Support — Darsh Dental Depot" },
      { name: "description", content: "Reach out to Darsh Dental Depot for order assistance, bulk clinic quotes, and material inquiries." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    clinicName: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Thank you! Your message has been received. Our clinical support team will contact you within 2 hours.");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        clinicName: "",
        subject: "",
        message: "",
      });
    }, 800);
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <Badge variant="outline" className="text-primary border-primary/30">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" /> Dedicated Clinic Support
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-heading tracking-tight text-foreground">
            How Can We Help <span className="text-gradient">Your Practice?</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Need urgent delivery, custom bulk quotes, or lot verification? Our dental material experts are ready to assist.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {[
            { icon: Phone, title: "Phone Helpline", value: "+91 98765 43210", desc: "Mon–Sat, 9AM to 8PM IST" },
            { icon: Mail, title: "Clinical Support", value: "support@darshdental.com", desc: "Direct inquiries & quotes" },
            { icon: MapPin, title: "Central Depot", value: "Vadodara, Gujarat", desc: "Express dispatch hub" },
            { icon: Clock, title: "Order Cutoff", value: "4:00 PM Daily", desc: "For same-day clinic shipping" },
          ].map((c) => (
            <Card key={c.title} className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60 text-center">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/15 to-sky-500/10 text-primary grid place-items-center mx-auto mb-4 shadow-sm">
                <c.icon className="h-6 w-6" />
              </div>
              <div className="font-bold text-sm text-foreground font-heading">{c.title}</div>
              <div className="text-sm font-semibold text-primary mt-1">{c.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.desc}</div>
            </Card>
          ))}
        </div>

        {/* Main Grid: Form + Map & Details */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <Card className="lg:col-span-7 p-6 sm:p-8 glass-card rounded-3xl border border-border/60 shadow-lg">
            <h2 className="text-2xl font-bold font-heading mb-1.5 text-foreground">Send an Inquiry</h2>
            <p className="text-xs text-muted-foreground mb-6">Fill out the form below and we will respond promptly.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">First Name *</Label>
                  <Input
                    required
                    placeholder="Dr. Rajesh"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="rounded-xl bg-background/70 border-border/60 text-sm h-11"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Last Name *</Label>
                  <Input
                    required
                    placeholder="Sharma"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="rounded-xl bg-background/70 border-border/60 text-sm h-11"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Email Address *</Label>
                  <Input
                    type="email"
                    required
                    placeholder="doctor@clinic.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-xl bg-background/70 border-border/60 text-sm h-11"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Phone Number *</Label>
                  <Input
                    type="tel"
                    required
                    placeholder="+91 98765 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="rounded-xl bg-background/70 border-border/60 text-sm h-11"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Clinic / Hospital Name</Label>
                <Input
                  placeholder="e.g. Apex Dental Care & Implant Center"
                  value={formData.clinicName}
                  onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                  className="rounded-xl bg-background/70 border-border/60 text-sm h-11"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Subject / Product Inquired</Label>
                <Input
                  placeholder="e.g. Bulk quote for 3M Filtek & Composite Syringes"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="rounded-xl bg-background/70 border-border/60 text-sm h-11"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Your Message *</Label>
                <Textarea
                  required
                  rows={4}
                  placeholder="Tell us about the quantity or special specifications your clinic requires..."
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
                {loading ? "Sending..." : "Submit Clinical Inquiry"} <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Card>

          {/* Map & Operational Info */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 glass-card rounded-3xl border border-border/60 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-sm font-heading">Verified Depot Sourcing</div>
                  <div className="text-xs text-muted-foreground">Certified medical supplier licensed in India</div>
                </div>
              </div>

              <div className="border-t border-border/40 pt-4 space-y-2 text-xs text-muted-foreground">
                <p>📍 <strong>Primary Hub:</strong> Darsh Dental Depot, Alkapuri / Sayajigunj, Vadodara, Gujarat 390005</p>
                <p>🚚 <strong>Cold-Chain Courier Partners:</strong> BlueDart Medical Express, Delhivery Healthcare, DTDC Express</p>
              </div>
            </Card>

            <Card className="overflow-hidden rounded-3xl border border-border/60 shadow-lg h-[340px] relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.6!2d73.1979845!3d22.2941654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc50752550793%3A0xff8cbe3bb9f64be5!2sDarsh%20Dental%20Depot!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, position: "absolute", inset: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Darsh Dental Depot Location"
              />
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
