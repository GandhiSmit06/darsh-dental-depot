import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Target, Eye, Heart, Award, ShieldCheck, Sparkles, Building2, Users, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Darsh Dental Depot & Glow" },
      { name: "description", content: "Our journey, mission, and dedication to dental excellence across India." },
    ],
  }),
  component: AboutPage,
});

const team = [
  { name: "Darsh Patel", role: "Founder & Managing Director", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", bio: "15+ years in dental supply chain & material science." },
  { name: "Dr. Anjali Rao", role: "Chief Clinical Officer", img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80", bio: "Endodontist & Quality Assurance Lead." },
  { name: "Vikram Singh", role: "Head of Logistics & Cold Chain", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", bio: "Specialist in time-critical medical freight." },
  { name: "Meera Iyer", role: "VP of Customer & Doctor Relations", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80", bio: "Dedicated to rapid clinic support and queries." },
];

const milestones = [
  { year: "2014", title: "Inception in Vadodara", desc: "Started as a specialized dental outlet serving local dentists." },
  { year: "2018", title: "Pan-Gujarat Expansion", desc: "Direct distribution network to over 1,200 private practices." },
  { year: "2022", title: "Digital Depot Platform", desc: "Launched automated 24/7 ordering and cold-chain parcel tracking." },
  { year: "2026", title: "National Depot & Glow", desc: "Serving 5,000+ certified clinics nationwide with instant GST compliance." },
];

function AboutPage() {
  return (
    <PublicLayout>
      {/* ─── Hero Section ────────────────────────────────────────────────── */}
      <section className="hero-gradient py-20 text-center relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="outline" className="text-primary border-primary/30 mb-3 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> Dedicated To Dental Excellence
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-extrabold font-heading tracking-tight text-foreground">
              Empowering India's Dentists With <span className="text-gradient">Authentic Supplies</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Founded in 2014 in Vadodara, Darsh Dental Depot has evolved into India's most trusted digital dental material ecosystem — ensuring that every doctor receives factory-certified materials at wholesale rates.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Core Values Cards ───────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Target, title: "Our Mission", desc: "Equip dental professionals with reliable, 100% genuine supplies without logistics friction or hidden costs." },
            { icon: Eye, title: "Our Vision", desc: "To set the national benchmark for verified dental e-commerce, precision cold-chain transit, and clinic satisfaction." },
            { icon: Heart, title: "Our Core Values", desc: "Integrity in sourcing, speed in delivery, and unconditional respect for the clinical precision of dental practitioners." },
          ].map((v, i) => (
            <Card key={v.title} className="p-7 glass-card glass-card-hover rounded-2xl border border-border/60">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/15 to-sky-500/10 text-primary grid place-items-center mb-5 shadow-sm">
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-bold text-xl text-foreground">{v.title}</h3>
              <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed">{v.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── Journey Timeline ────────────────────────────────────────────── */}
      <section className="bg-secondary/30 border-y border-border/50 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-14 space-y-2">
            <Badge variant="outline" className="text-primary border-primary/30">Milestones</Badge>
            <h2 className="text-3xl font-bold font-heading">Our Decade of Growth</h2>
            <p className="text-sm text-muted-foreground">From a single storefront to a nationwide digital dental supply leader.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((m) => (
              <Card key={m.year} className="p-5 glass-card rounded-2xl border border-border/60 relative">
                <div className="text-2xl font-extrabold font-heading text-primary">{m.year}</div>
                <div className="font-bold text-sm text-foreground mt-1">{m.title}</div>
                <div className="text-xs text-muted-foreground mt-2 leading-relaxed">{m.desc}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Meet the Leadership Team ─────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <Badge variant="outline" className="text-primary border-primary/30">Leadership</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading">Meet Our Team</h2>
          <p className="text-sm text-muted-foreground">The clinical experts and supply chain veterans behind Darsh Dental Depot.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((m) => (
            <Card key={m.name} className="p-5 glass-card glass-card-hover rounded-2xl border border-border/60 text-center">
              <div className="relative mx-auto w-24 h-24 mb-4 rounded-full overflow-hidden border-2 border-primary/20 shadow-md">
                <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <div className="font-bold text-base text-foreground font-heading">{m.name}</div>
              <div className="text-xs font-semibold text-primary mt-0.5">{m.role}</div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{m.bio}</p>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button size="lg" asChild className="rounded-full px-8 h-12 bg-primary hover:bg-primary/90 text-white shadow-lg btn-shine">
            <Link to="/products">
              Explore Our Product Catalog <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
