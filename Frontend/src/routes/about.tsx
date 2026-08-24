import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/site/PublicLayout";
import {
  Target,
  Eye,
  Heart,
  ShieldCheck,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  ScaleReveal,
  SectionHeading,
} from "@/components/animations/ScrollReveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Darsh Dental Depot Vadodara" },
      {
        name: "description",
        content:
          "The story and clinical commitment of Darsh Dental Depot, Vadodara's dedicated dental supply store.",
      },
    ],
  }),
  component: AboutPage,
});

const MAPS_URL = "https://maps.app.goo.gl/7czn6gwYUgdSm8b46";
const PHONE_NUMBER = "+91 97270 76119";
const PHONE_RAW = "+919727076119";

const milestones = [
  {
    year: "2014",
    title: "Store Founded at Shiyabaug",
    desc: "Established at Vraj Vihar Complex to provide authentic materials directly to Vadodara dentists.",
  },
  {
    year: "2018",
    title: "All Major Brand Partnerships",
    desc: "Authorized distribution for 3M, Ivoclar, GC, Dentsply Sirona, Mani, and Septodont.",
  },
  {
    year: "2022",
    title: "2-Hour Clinic Express Delivery",
    desc: "Implemented same-day clinic delivery network across all areas of Vadodara.",
  },
  {
    year: "2026",
    title: "Digital Depot Platform",
    desc: "Seamless 24/7 digital material ordering and automated GST invoicing for Vadodara doctors.",
  },
];

const vadodaraZones = [
  "Alkapuri & RC Dutt Road",
  "Akota & Old Padra Road",
  "Gotri, Sevasi & Vasna",
  "Karelibaug & VIP Road",
  "Manjalpur & Makarpura",
  "Fatehgunj & Sayajigunj",
  "Shiyabaug & Kevdabaug",
  "Waghodia Road & Ajwa Road",
];

function AboutPage() {
  return (
    <PublicLayout>
      {/* ─── Hero Section ────────────────────────────────────────────────── */}
      <section className="hero-gradient py-20 text-center relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Badge variant="outline" className="text-primary border-primary/30 mb-3 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> Vadodara's Exclusive Dental Supply Depot
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl font-extrabold font-heading tracking-tight text-foreground"
          >
            Dedicated Solely To <span className="text-gradient">Vadodara's Dentists</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            Founded and managed in Vadodara, Darsh Dental Depot provides local dental doctors with 100% genuine consumables, instruments, and materials with instant local delivery.
          </motion.p>
        </div>
      </section>

      {/* ─── Store Highlights Cards ───────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-12">
        <StaggerContainer staggerDelay={0.12} className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Target,
              title: "Our Purpose",
              desc: "Ensure no dentist in Vadodara has to delay a clinical procedure due to supply shortages or unauthentic materials.",
            },
            {
              icon: Eye,
              title: "Local Excellence",
              desc: "Building lasting clinical relationships with dental practices through honest pricing, fast delivery, and authentic batches.",
            },
            {
              icon: Heart,
              title: "Clinical Trust",
              desc: "Every composite, file, and cement comes with original batch numbers and manufacturer warranty support.",
            },
          ].map((v) => (
            <StaggerItem key={v.title} scale>
              <Card className="p-7 glass-card glass-card-hover rounded-2xl border border-border/60 h-full">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/15 to-sky-500/10 text-primary grid place-items-center mb-5 shadow-sm">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-xl text-foreground">{v.title}</h3>
                <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed">{v.desc}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ─── Journey Timeline ────────────────────────────────────────────── */}
      <section className="bg-secondary/30 border-y border-border/50 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <SectionHeading
            badge="Our Journey"
            title="Growing With Vadodara's Dental Community"
            subtitle="Serving local clinics with dedication and precision."
            className="mb-14"
          />

          <StaggerContainer staggerDelay={0.12} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((m) => (
              <StaggerItem key={m.year} direction="left" scale>
                <Card className="p-5 glass-card rounded-2xl border border-border/60 relative h-full">
                  <div className="text-2xl font-extrabold font-heading text-primary">{m.year}</div>
                  <div className="font-bold text-sm text-foreground mt-1">{m.title}</div>
                  <div className="text-xs text-muted-foreground mt-2 leading-relaxed">{m.desc}</div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── Physical Store & Delivery Coverage ─────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <ScrollReveal direction="left" className="lg:col-span-6 space-y-6">
            <Badge variant="outline" className="text-primary border-primary/30">
              Physical Depot Location
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground">
              Visit Us at Shiyabaug, Vadodara
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Our full-service dental materials showroom is centrally located in Vadodara. Doctors and clinical staff are always welcome to inspect materials, test dental instruments, or collect urgent supplies directly.
            </p>

            <div className="p-5 rounded-2xl bg-secondary/50 border border-border/60 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-foreground">Depot Address:</span>
                  <p className="text-muted-foreground mt-0.5 leading-relaxed">
                    FF-10/11, Vraj Vihar Complex, Char Rasta, Opp. Kachhia Patel Wadi, Mahavir Colony, Shiyabaug, Kevdabaug, Vadodara, Gujarat 390001
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2 border-t border-border/40">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="font-bold text-foreground">Operating Hours:</span>
                  <span className="text-muted-foreground ml-1">Mon – Sat: 10:00 AM – 8:30 PM (Sun: Closed)</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2 border-t border-border/40">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="font-bold text-foreground">Direct Call & WhatsApp:</span>
                  <a href={`tel:${PHONE_RAW}`} className="text-primary font-bold ml-1 hover:underline">
                    {PHONE_NUMBER}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild className="rounded-full px-6 h-11 bg-primary text-white shadow-md btn-shine">
                <a href={MAPS_URL} target="_blank" rel="noreferrer">
                  Open Google Maps <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" asChild className="rounded-full px-6 h-11 border-border/60">
                <Link to="/products">
                  Explore Products <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.15} className="lg:col-span-6">
            <Card className="p-6 glass-card rounded-3xl border border-border/60 space-y-4">
              <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Same-Day Delivery Across Vadodara
              </h3>
              <p className="text-xs text-muted-foreground">
                We deliver directly to dental clinics across all major Vadodara sectors:
              </p>

              <StaggerContainer staggerDelay={0.06} className="grid grid-cols-2 gap-2.5 pt-2">
                {vadodaraZones.map((z) => (
                  <StaggerItem key={z}>
                    <div className="p-2.5 rounded-xl bg-background/80 border border-border/40 text-xs font-semibold text-foreground flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span>{z}</span>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </Card>
          </ScrollReveal>
        </div>
      </section>
    </PublicLayout>
  );
}
