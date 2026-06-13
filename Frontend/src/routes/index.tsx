import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ShieldCheck, Truck, Headphones, Award, ArrowRight, Star, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PublicLayout } from "@/components/site/PublicLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { brands, categories, faqs, featuredProducts, testimonials } from "@/lib/mock-data";

export const Route = createFileRoute("/")({ component: HomePage });

const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

function HomePage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="hero-gradient">
        <div className="container mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge variant="secondary" className="mb-4 border">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-success" />
                Trusted by 5,000+ clinics
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                Trusted Dental Materials <span className="text-primary">Supplier</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl">
                Premium-grade composites, instruments and consumables sourced directly from world-class manufacturers — delivered fast to your clinic.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link to="/products">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> 100% Genuine</div>
                <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Free shipping over $500</div>
                <div className="flex items-center gap-2"><Headphones className="h-4 w-4 text-primary" /> 24/7 Support</div>
              </div>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <div className="relative">
              <div className="absolute -inset-6 bg-primary/10 blur-3xl rounded-full" />
              <img
                src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=80"
                alt="Dental clinic"
                className="relative rounded-2xl shadow-2xl border w-full aspect-[4/3] object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <motion.div {...fade} className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
            <p className="text-muted-foreground mt-2">Everything your practice needs, organized.</p>
          </div>
          <Button variant="ghost" asChild><Link to="/products">View all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </motion.div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {categories.slice(0, 8).map((c, i) => (
            <motion.div key={c} {...fade} transition={{ duration: 0.4, delay: i * 0.04 }}>
              <Link to="/products" className="block">
                <Card className="p-5 hover:border-primary hover:shadow-md transition-all">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center mb-3">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="font-semibold">{c}</div>
                  <div className="text-xs text-muted-foreground mt-1">120+ products</div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-12">
        <motion.div {...fade} className="flex items-end justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
          <Button variant="ghost" asChild><Link to="/products">All products <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </motion.div>
        <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Why us */}
      <section className="bg-card border-y mt-16">
        <div className="container mx-auto px-4 py-16">
          <motion.h2 {...fade} className="text-3xl font-bold text-center">Why choose Darsh Dental Depot</motion.h2>
          <p className="text-center text-muted-foreground mt-2">Built for clinics that don't compromise.</p>
          <div className="grid md:grid-cols-4 gap-6 mt-10">
            {[
              { i: ShieldCheck, t: "Authentic Products", d: "Sourced directly from authorized distributors." },
              { i: Truck, t: "Fast Delivery", d: "Most metros in 1–3 business days." },
              { i: Award, t: "Best Pricing", d: "Tiered discounts for clinics and shops." },
              { i: Headphones, t: "Expert Support", d: "Dental specialists on call, 24/7." },
            ].map((f, i) => (
              <motion.div key={f.t} {...fade} transition={{ duration: 0.4, delay: i * 0.05 }}>
                <Card className="p-6 h-full">
                  <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary grid place-items-center mb-4">
                    <f.i className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{f.t}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{f.d}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="container mx-auto px-4 py-16">
        <motion.h2 {...fade} className="text-center text-sm uppercase tracking-widest text-muted-foreground mb-8">
          Trusted Brands We Carry
        </motion.h2>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
          {brands.map((b) => (
            <div key={b} className="text-lg md:text-xl font-semibold text-muted-foreground/70 hover:text-foreground transition-colors">
              {b}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-card border-y">
        <div className="container mx-auto px-4 py-16">
          <motion.h2 {...fade} className="text-3xl font-bold text-center">What dentists say</motion.h2>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} {...fade} transition={{ duration: 0.4, delay: i * 0.05 }}>
                <Card className="p-6 h-full">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed">"{t.quote}"</p>
                  <div className="mt-4 pt-4 border-t">
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <motion.h2 {...fade} className="text-3xl font-bold text-center mb-8">Frequently asked questions</motion.h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`f-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Contact */}
      <section id="contact" className="container mx-auto px-4 py-16">
        <Card className="p-8 md:p-12 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Get in touch</h2>
            <p className="text-muted-foreground mt-2">We typically respond within an hour during business hours.</p>
            <div className="mt-6 space-y-3 text-sm">
              <div><span className="font-semibold">Phone:</span> +91 98765 43210</div>
              <div><span className="font-semibold">Email:</span> hello@darshdental.com</div>
              <div><span className="font-semibold">Address:</span> 12, Linking Road, Mumbai, India</div>
            </div>
          </div>
          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            <Input placeholder="Your name" />
            <Input type="email" placeholder="Email" />
            <Textarea placeholder="How can we help?" rows={4} />
            <Button className="w-full" type="submit">Send message</Button>
          </form>
        </Card>
      </section>
    </PublicLayout>
  );
}
