import { Link } from "@tanstack/react-router";
import { Logo } from "./Navbar";
import {
  ShieldCheck,
  Truck,
  Clock,
  Phone,
  MapPin,
  ExternalLink,
  MessageSquare,
  FileText,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thank you Doctor! You are subscribed to Vadodara depot material stock updates.");
    setEmail("");
  };

  return (
    <footer className="border-t border-border/70 dark:border-white/8 bg-background dark:bg-[#060913] mt-28 relative overflow-hidden">
      {/* ── Top Quality Pillars ── */}
      <div className="border-b border-border/50 dark:border-white/8 py-8 bg-secondary/30 dark:bg-white/[0.01]">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-background/80 dark:bg-white/[0.03] border border-border/70 dark:border-white/8">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-foreground">100% Genuine Direct</div>
              <div className="text-xs text-muted-foreground">Authorized Mani, GC, Ivoclar, 3M</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-background/80 dark:bg-white/[0.03] border border-border/70 dark:border-white/8">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 grid place-items-center shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-foreground">Same-Day Vadodara Dispatch</div>
              <div className="text-xs text-muted-foreground">Direct delivery to your dental clinic</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-background/80 dark:bg-white/[0.03] border border-border/70 dark:border-white/8">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 grid place-items-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-foreground">Tally ERP GST Invoices</div>
              <div className="text-xs text-muted-foreground">Official tax bill with HSN breakdown</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-background/80 dark:bg-white/[0.03] border border-border/70 dark:border-white/8">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 grid place-items-center shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-foreground">Wholesale Depot Rates</div>
              <div className="text-xs text-muted-foreground">COD & Instant Razorpay UPI</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Footer Navigation Grid ── */}
      <div className="container mx-auto px-4 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        {/* Brand & Mission */}
        <div className="lg:col-span-2 space-y-4">
          <Logo />
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            Darsh Dental Depot is Vadodara's dedicated dental supply depot, empowering clinics with authentic restorative materials, rotary files, instruments, and express local delivery.
          </p>

          <div className="space-y-1.5 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">Drug Licenses:</span>
              <span className="text-mono-data text-foreground font-semibold">DL No. GJ-VAD-215550 & GJ-VAD-215551</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">GSTIN / UIN:</span>
              <span className="text-mono-data text-foreground font-semibold">24ANKPG4381M1ZP</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">Bank A/c:</span>
              <span className="text-mono-data">IDBI Bank Ltd • A/c 0553102000031189</span>
            </div>
          </div>

          <div className="pt-2">
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
              <Input
                type="email"
                placeholder="Enter doctor / clinic email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full bg-background dark:bg-white/[0.04] text-xs h-9 border-border/80"
                required
              />
              <Button type="submit" size="sm" className="rounded-full px-4 h-9 bg-primary text-white font-bold">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground mb-3.5">
            Dental Categories
          </h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link to="/products" className="hover:text-primary transition-colors">Composite & Restoratives</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors">Mani Diamond Burs</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors">Endodontic Rotary Files</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors">Impression Materials (Alginate)</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors">Glass Ionomer Cements (GIC)</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors">Sterilization & Disposables</Link></li>
          </ul>
        </div>

        {/* Portals & Depot */}
        <div>
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground mb-3.5">
            Clinic Portals
          </h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link to="/login" className="hover:text-primary transition-colors">Doctor Portal Login</Link></li>
            <li><Link to="/register" className="hover:text-primary transition-colors">Register Clinic (Vadodara)</Link></li>
            <li><Link to="/about" className="hover:text-primary transition-colors">About Our Depot</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Store Location & Hours</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors">Wholesale Catalog</Link></li>
          </ul>
        </div>

        {/* Store & Contact Info */}
        <div>
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground mb-3.5">
            Depot Location
          </h4>
          <div className="space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
              <a href="tel:+919727076119" className="font-bold text-foreground hover:text-primary transition-colors">
                +91 97270 76119
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <a
                href="https://wa.me/919727076119"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                WhatsApp Helpline
              </a>
            </div>
            <div className="flex items-start gap-2 pt-1 border-t border-border/50">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                  Vraj Vihar Complex, Near Khanderao Market, Shiyabaug, Kevdabaug, Vadodara, Gujarat 390001
                </p>
                <a
                  href="https://maps.app.goo.gl/7czn6gwYUgdSm8b46"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-primary font-bold hover:underline mt-1"
                >
                  Open in Google Maps <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50 dark:border-white/8 py-5 text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between container mx-auto px-4 gap-3">
        <div>
          © {new Date().getFullYear()} <span className="font-bold text-foreground">Darsh Dental Depot</span>. Precision Dental Supplies for Vadodara Clinics.
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Proprietors: Hetal Gandhi & Smit Gandhi</span>
          <span>•</span>
          <span>Siyabaug, Vadodara</span>
        </div>
      </div>
    </footer>
  );
}
