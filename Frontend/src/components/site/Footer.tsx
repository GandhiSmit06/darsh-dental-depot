import { Link } from "@tanstack/react-router";
import { Logo } from "./Navbar";
import {
  ShieldCheck,
  Truck,
  Clock,
  Sparkles,
  Send,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/ScrollReveal";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thank you! You will receive daily Vadodara depot stock updates.");
    setEmail("");
  };

  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-background via-background to-secondary/40 mt-28 relative overflow-hidden">
      {/* Decorative top glow border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Trust & Guarantee Highlights Bar */}
      <div className="border-b border-border/40 py-8 bg-secondary/30 backdrop-blur-md">
        <StaggerContainer staggerDelay={0.1} className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StaggerItem>
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-background/50 border border-border/30">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-xs uppercase tracking-wider">100% Genuine Guaranteed</div>
                <div className="text-xs text-muted-foreground">Direct manufacturer authentic batch</div>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-background/50 border border-border/30">
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 grid place-items-center shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-xs uppercase tracking-wider">Same-Day Vadodara Delivery</div>
                <div className="text-xs text-muted-foreground">Direct to your dental clinic</div>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-background/50 border border-border/30">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 grid place-items-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-xs uppercase tracking-wider">Mon–Sat: 10AM – 8:30PM</div>
                <div className="text-xs text-muted-foreground">Sunday: Emergency on call</div>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-background/50 border border-border/30">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 grid place-items-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-xs uppercase tracking-wider">Direct Depot Wholesale Rates</div>
                <div className="text-xs text-muted-foreground">Special pricing for Vadodara doctors</div>
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>

      <StaggerContainer staggerDelay={0.12} className="container mx-auto px-4 py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        {/* Brand Column */}
        <StaggerItem className="lg:col-span-2 space-y-4">
          <Logo />
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            Darsh Dental Depot is Vadodara's premier physical & digital dental supply depot, providing local dentists with factory-certified composites, instruments, and consumables with prompt local clinic delivery.
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
              Subscribe for Vadodara clinic offers & fresh material batch arrivals.
            </span>
          </div>
        </StaggerItem>

        {/* Quick Links */}
        <StaggerItem>
          <h4 className="font-heading font-bold text-sm mb-4 tracking-wide text-foreground uppercase text-[11px]">
            Dental Catalog
          </h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/products" className="hover:text-primary transition-colors flex items-center gap-1.5">All Products</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors flex items-center gap-1.5">Composite & Restorative</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors flex items-center gap-1.5">Endodontic Rotary Files</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors flex items-center gap-1.5">Impression Materials</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors flex items-center gap-1.5">Sterilization & Disposables</Link></li>
          </ul>
        </StaggerItem>

        {/* Quick Links */}
        <StaggerItem>
          <h4 className="font-heading font-bold text-sm mb-4 tracking-wide text-foreground uppercase text-[11px]">
            Vadodara Doctor Portal
          </h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary transition-colors">Our Vadodara Store</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Depot Location & Hours</Link></li>
            <li><Link to="/login" className="hover:text-primary transition-colors">Doctor Portal Login</Link></li>
            <li><Link to="/register" className="hover:text-primary transition-colors">Register Clinic (Vadodara)</Link></li>
          </ul>
        </StaggerItem>

        {/* Store Location & Timings */}
        <StaggerItem>
          <h4 className="font-heading font-bold text-sm mb-4 tracking-wide text-foreground uppercase text-[11px]">
            Store & Contact Info
          </h4>
          <ul className="space-y-3 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <a href="tel:+919727076119" className="font-bold text-foreground hover:text-primary transition-colors">
                +91 97270 76119
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-500 shrink-0" />
              <a
                href="https://wa.me/919727076119"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Chat on WhatsApp
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground">Mon – Sat:</span> 10:00 AM – 8:30 PM
                <div className="text-[11px] text-muted-foreground">Sunday: Closed (Surgeries on Call)</div>
              </div>
            </li>
            <li className="flex items-start gap-2 pt-1 border-t border-border/40">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground">Darsh Dental Depot:</span>
                <p className="text-[11px] leading-tight text-muted-foreground mt-0.5">
                  FF-10/11, Vraj Vihar Complex, Char Rasta, Opp. Kachhia Patel Wadi, Shiyabaug, Kevdabaug, Vadodara, Gujarat 390001
                </p>
                <a
                  href="https://maps.app.goo.gl/7czn6gwYUgdSm8b46"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-primary font-bold hover:underline mt-1.5"
                >
                  View on Google Maps <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </li>
          </ul>
        </StaggerItem>
      </StaggerContainer>

      <div className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between container mx-auto px-4 gap-3">
        <div>
          © {new Date().getFullYear()} <span className="font-semibold text-foreground">Darsh Dental Depot</span>. Exclusively serving dentists across Vadodara, Gujarat.
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <a href="https://maps.app.goo.gl/7czn6gwYUgdSm8b46" target="_blank" rel="noreferrer" className="hover:text-primary cursor-pointer">
            Google Maps Location
          </a>
          <span>•</span>
          <span className="hover:text-primary cursor-pointer">GST Invoicing</span>
          <span>•</span>
          <span className="hover:text-primary cursor-pointer">100% Authentic Materials</span>
        </div>
      </div>
    </footer>
  );
}
