import { Link } from "@tanstack/react-router";
import { Logo } from "./Navbar";
import { ShieldCheck, Truck, Clock, Sparkles, Send, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thank you for subscribing to Darsh Dental Depot updates!");
    setEmail("");
  };

  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-background via-background to-secondary/40 mt-28 relative overflow-hidden">
      {/* Decorative top glow border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Trust & Guarantee Highlights Bar */}
      <div className="border-b border-border/40 py-8 bg-secondary/30 backdrop-blur-md">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-background/50 border border-border/30">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider">100% Genuine Guaranteed</div>
              <div className="text-xs text-muted-foreground">Direct manufacturer warranty</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-background/50 border border-border/30">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 grid place-items-center shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider">Priority Express Shipping</div>
              <div className="text-xs text-muted-foreground">Pan-India clinic delivery</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-background/50 border border-border/30">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 grid place-items-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider">24/7 Dental Support</div>
              <div className="text-xs text-muted-foreground">Expert clinical assistance</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-background/50 border border-border/30">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 grid place-items-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider">Doctor Wholesale Rates</div>
              <div className="text-xs text-muted-foreground">Tiered bulk clinic savings</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Logo />
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            Darsh Dental Depot is India's leading digital platform for verified dental consumables, advanced equipment, and clinical inventory management.
          </p>
          
          <div className="pt-2">
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
              <Input
                type="email"
                placeholder="Enter doctor / clinic email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full bg-background/80 text-xs h-10 border-border/60 focus:border-primary"
                required
              />
              <Button type="submit" size="sm" className="rounded-full px-4 h-10 bg-primary hover:bg-primary/90 shadow-md">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
            <span className="text-[11px] text-muted-foreground mt-1.5 block">
              Subscribe for exclusive doctor discounts & batch expiry alerts.
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-heading font-bold text-sm mb-4 tracking-wide text-foreground uppercase text-[11px]">
            Dental Catalog
          </h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/products" className="hover:text-primary transition-colors flex items-center gap-1.5">All Products</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors flex items-center gap-1.5">Composite & Restorative</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors flex items-center gap-1.5">Endodontic Files & Motors</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors flex items-center gap-1.5">Impression Materials</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors flex items-center gap-1.5">Sterilization & PPE</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-heading font-bold text-sm mb-4 tracking-wide text-foreground uppercase text-[11px]">
            Portal & Info
          </h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary transition-colors">About Our Story</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Clinic Support</Link></li>
            <li><Link to="/login" className="hover:text-primary transition-colors">Doctor Portal Login</Link></li>
            <li><Link to="/register" className="hover:text-primary transition-colors">Register Clinic</Link></li>
            <li><Link to="/shop" className="hover:text-primary transition-colors">Distributor Center</Link></li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h4 className="font-heading font-bold text-sm mb-4 tracking-wide text-foreground uppercase text-[11px]">
            Direct Contact
          </h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span>orders@darshdental.com</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>Vadodara & Mumbai, India</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between container mx-auto px-4 gap-3">
        <div>
          © {new Date().getFullYear()} <span className="font-semibold text-foreground">Darsh Dental Depot & Glow</span>. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-primary cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="hover:text-primary cursor-pointer">Quality Certifications</span>
        </div>
      </div>
    </footer>
  );
}
