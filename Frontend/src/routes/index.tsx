import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  Headphones,
  Award,
  ArrowRight,
  Star,
  CheckCircle2,
  Sparkles,
  Zap,
  Package,
  Layers,
  Activity,
  FileCheck,
  Search,
  ChevronRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { PublicLayout } from "@/components/site/PublicLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { productsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { brands, categories, faqs, testimonials, mockProducts } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/")({ component: HomePage });

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemFade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function HomePage() {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: featuredResponse } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productsApi.getProducts(true),
    enabled: isAuthenticated,
  });

  const apiProducts = featuredResponse?.data || [];
  const displayProducts = apiProducts.length > 0 ? apiProducts : mockProducts;

  const filteredProducts = displayProducts.filter((p: any) => {
    const matchesCategory =
      selectedCategory === "All" ||
      (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesSearch =
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PublicLayout>
      {/* ─── Hero Section ────────────────────────────────────────────────── */}
      <section className="hero-gradient pt-16 pb-24 md:pt-24 md:pb-32 relative overflow-hidden">
        {/* Decorative Grid Pattern Overlay */}
        <div className="absolute inset-0 grid-pattern opacity-60 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold backdrop-blur-md"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
                <span>India's Premier Digital Dental Material Depot</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.08] text-foreground"
              >
                Precision Dental Supplies For{" "}
                <span className="text-gradient block sm:inline">Modern Practices</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed"
              >
                Direct access to authentic composites, endodontic equipment, surgical instruments, and daily consumables from global dental manufacturers — delivered straight to your clinic in 24–48 hours.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <Button
                  size="lg"
                  asChild
                  className="rounded-2xl h-13 px-8 text-base font-bold bg-gradient-to-r from-primary via-sky-600 to-indigo-600 hover:opacity-95 text-white shadow-lg shadow-primary/25 btn-shine"
                >
                  <Link to="/products">
                    Explore Dental Catalog <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="rounded-2xl h-13 px-7 text-base font-semibold glass-card border-border/80 hover:bg-secondary"
                >
                  <Link to="/register">Doctor Registration</Link>
                </Button>
              </motion.div>

              {/* Trust Badges Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="pt-6 border-t border-border/40 grid grid-cols-3 gap-3 text-xs sm:text-sm font-medium text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span>100% Genuine Certified</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 grid place-items-center shrink-0">
                    <Truck className="h-4 w-4" />
                  </div>
                  <span>Express Dispatch</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </div>
                  <span>4.9/5 Doctor Rating</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column: 3D Floating Hero Showcase */}
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative mx-auto max-w-md lg:max-w-none"
              >
                {/* Glow Backdrop */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-indigo-500/30 rounded-3xl blur-2xl opacity-70 -z-10 animate-pulse-slow" />

                {/* Main Card Frame */}
                <div className="relative rounded-3xl overflow-hidden glass-card border border-border/80 shadow-2xl p-2 bg-gradient-to-b from-card to-background">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                    <img
                      src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80"
                      alt="Modern dental clinic equipment"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <Badge className="bg-primary/90 text-white text-[10px] uppercase font-bold tracking-wider mb-1">
                        Featured Batch
                      </Badge>
                      <div className="font-heading font-bold text-lg leading-tight">
                        3M™ Filtek™ Universal Restorative
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">
                        In-stock with verified lot temperature tracking
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Widget 1: Live Order Notification */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -left-6 sm:-left-8 glass-card border border-border/80 shadow-xl rounded-2xl p-3.5 flex items-center gap-3 backdrop-blur-xl bg-card/90 max-w-[240px]"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center shrink-0 shadow-md">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-xs font-bold text-foreground">Dr. Mehta (Mumbai)</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Ordered Endo Rotary Kit</div>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">Just now • Dispatched</span>
                  </div>
                </motion.div>

                {/* Floating Widget 2: Doctor Wholesale Card */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-6 -right-4 sm:-right-6 glass-card border border-border/80 shadow-xl rounded-2xl p-3.5 flex items-center gap-3 backdrop-blur-xl bg-card/90"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white grid place-items-center shrink-0 shadow-md">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Clinic Savings Tier</div>
                    <div className="text-[11px] text-primary font-bold">Up to 30% Wholesale OFF</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Live Stats Strip ────────────────────────────────────────────── */}
      <section className="border-y border-border/50 bg-secondary/40 py-10 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-primary">5,000+</div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">Clinics & Doctors Served</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-sky-500">25,000+</div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">Orders Delivered Safely</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-indigo-500">500+</div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">Verified Dental Brands</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-emerald-500">99.8%</div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">On-Time Clinic Delivery</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Shop By Category ────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <Badge variant="outline" className="mb-2 text-primary border-primary/30">
              Structured Catalog
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">
              Explore by Specialty
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
              Everything your practice requires, sorted by dental specialization.
            </p>
          </div>
          <Button variant="ghost" asChild className="rounded-full hover:text-primary font-semibold text-sm">
            <Link to="/products">
              View Complete Catalog <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4"
        >
          {categories.slice(0, 8).map((cat, i) => (
            <motion.div key={cat} variants={itemFade}>
              <Link to="/products" className="block group">
                <Card className="p-5 glass-card glass-card-hover border border-border/60 hover:border-primary/50 rounded-2xl transition-all duration-300">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/15 to-sky-500/10 text-primary grid place-items-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="font-bold font-heading text-base text-foreground group-hover:text-primary transition-colors">
                    {cat}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <span>150+ Products</span>
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Featured Products Section ───────────────────────────────────── */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <Badge variant="outline" className="mb-2 text-primary border-primary/30">
              Verified Depot
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">
              Featured Clinical Supplies
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Hand-picked materials and instruments trusted by top clinics across India.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {["All", "Restorative", "Endodontics", "Impression"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedCategory(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  selectedCategory === tab
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-border/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.slice(0, 8).map((product: any) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" asChild className="rounded-full px-8 h-12 bg-secondary hover:bg-secondary/80 text-foreground border border-border/80 font-bold text-sm">
            <Link to="/products">
              Browse All {displayProducts.length}+ Dental Materials <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ─── Why Choose Us: Feature Cards ────────────────────────────────── */}
      <section className="bg-secondary/30 border-y border-border/50 py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="text-primary border-primary/30">
              Why Darsh Dental Depot
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">
              Engineered For Dental Clinics
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              We eliminate counterfeit risks, delayed deliveries, and inflated retail pricing for dental professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">Direct OEM Sourcing</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Zero third-party middlemen. Every composite, bur, and resin carries valid batch verification from authorized manufacturers.
              </p>
            </Card>

            <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60">
              <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-500 grid place-items-center mb-5">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">Doctor Wholesale Rates</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Verified clinics unlock wholesale pricing tiers with additional volume discounts on monthly clinic consumables.
              </p>
            </Card>

            <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 grid place-items-center mb-5">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">Temperature Controlled</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Specialized insulated packaging for heat-sensitive bonding agents, cements, and anesthetic cartridges.
              </p>
            </Card>

            <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 grid place-items-center mb-5">
                <FileCheck className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">Automated GST Invoices</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Instant digital invoices with full GST compliance, ready for clinic tax filing and seamless expense tracking.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Doctor Testimonials ─────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <Badge variant="outline" className="text-primary border-primary/30">
            Dentist Testimonials
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">
            Trusted by Top Dental Surgeons
          </h2>
          <p className="text-muted-foreground text-sm">
            Read what practitioners across Gujarat and India have to say about our service.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card key={t.name} className="p-6 glass-card rounded-2xl border border-border/60 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/40 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-sky-600 text-white font-bold text-sm grid place-items-center shadow-sm">
                  {t.name.split(" ")[1]?.[0] || t.name[0]}
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">{t.name}</div>
                  <div className="text-xs text-primary font-medium">{t.clinic}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── FAQ Section ─────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-sm">
            Everything you need to know about clinic ordering, delivery, and authenticity.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`faq-${i}`}
              className="glass-card border border-border/60 rounded-2xl px-5 overflow-hidden"
            >
              <AccordionTrigger className="text-left font-semibold text-sm sm:text-base hover:no-underline py-4">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ─── Bottom High-Impact CTA Banner ───────────────────────────────── */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-sky-600 to-indigo-700 p-8 sm:p-14 text-white shadow-2xl">
          {/* Decorative floating blur orb */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <Badge className="bg-white/20 text-white backdrop-blur-md border-0 text-xs font-semibold px-3 py-1">
              ⚡ Instant Clinic Verification
            </Badge>

            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight leading-tight">
              Ready to Upgrade Your Clinic's Supply Chain?
            </h2>

            <p className="text-sky-100 text-sm sm:text-base leading-relaxed">
              Join thousands of dental surgeons across India saving time and money on verified clinical materials.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                size="lg"
                asChild
                className="rounded-2xl h-12 px-7 bg-white text-primary hover:bg-sky-50 font-bold text-sm shadow-lg btn-shine"
              >
                <Link to="/register">
                  Register Your Clinic <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-2xl h-12 px-6 border-white/40 text-white hover:bg-white/10 font-semibold text-sm backdrop-blur-sm"
              >
                <Link to="/contact">Talk to Dental Specialist</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
