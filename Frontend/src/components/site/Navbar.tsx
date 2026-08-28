import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  ShoppingCart,
  Moon,
  Sun,
  LayoutDashboard,
  LogOut,
  ArrowRight,
  Phone,
  Search,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Dental Catalog" },
  { to: "/about", label: "About Depot" },
  { to: "/contact", label: "Vadodara Location" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-3 group select-none ${className || ""}`}>
      <div className="relative shrink-0">
        <div className="h-10 w-10 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-border/80 dark:border-white/15 shadow-xs flex items-center justify-center p-0.5 group-hover:border-primary/50 transition-colors">
          <img
            src="/logo.jpg"
            alt="Darsh Dental Depot"
            className="w-full h-full object-cover rounded-[inherit] transform group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
      <div className="leading-none flex flex-col justify-center">
        <span className="font-extrabold text-base tracking-tight font-heading text-foreground group-hover:text-primary transition-colors">
          DARSH DENTAL
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-primary mt-0.5">
          DEPOT • VADODARA
        </span>
      </div>
    </Link>
  );
}

export function Navbar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const nav = useNavigate();

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "shop_owner") return "/shop";
    return "/doctor";
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300 bg-background/85 dark:bg-[#060913]/85 backdrop-blur-2xl border-b border-border/60 dark:border-white/8">
      {/* ── Top Micro Telemetry Bar ── */}
      <div className="hidden sm:flex items-center justify-between px-6 py-1 bg-secondary/40 dark:bg-white/[0.02] border-b border-border/40 text-[11px] font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-foreground">Siyabaug Central Depot Open</span>
          <span className="text-border dark:text-white/10">•</span>
          <span>Same-Day Express Dispatch Across Vadodara Clinics</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-mono-data">DL: GJ-VAD-215550</span>
          <span className="text-border dark:text-white/10">•</span>
          <a
            href="tel:+919727076119"
            className="hover:text-primary font-bold text-foreground transition-colors flex items-center gap-1"
          >
            <Phone className="h-3 w-3 text-primary" /> +91 97270 76119
          </a>
        </div>
      </div>

      {/* ── Main Navigation Island ── */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Logo />

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-secondary/60 dark:bg-white/[0.04] border border-border/70 dark:border-white/8">
          {links.map((l) => {
            const active = l.to === "/" ? path === "/" : path.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                  active
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 bg-background dark:bg-white/10 rounded-full border border-border/80 dark:border-white/10 shadow-xs -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Search Shortcut */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => nav({ to: "/products" })}
            className="hidden md:flex items-center gap-2 h-9 px-3 text-xs font-medium text-muted-foreground hover:text-foreground rounded-full border-border/80 dark:border-white/10 bg-background/50"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search Catalog...</span>
            <kbd className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border/60">
              ⌘K
            </kbd>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Toggle theme"
            className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-sky-600" />}
              </motion.div>
            </AnimatePresence>
          </Button>

          {/* Quick Cart */}
          {(!user || user.role === "doctor") && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hidden sm:inline-flex rounded-full h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/80 relative"
            >
              <Link to={user ? "/doctor" : "/products"}>
                <ShoppingCart className="h-4 w-4" />
              </Link>
            </Button>
          )}

          {/* Auth State CTAs */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                asChild
                className="hidden sm:inline-flex rounded-full font-bold text-xs px-4 h-9 bg-primary hover:bg-primary/90 text-white shadow-xs"
              >
                <Link to={getDashboardPath()}>
                  <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                  {user.role === "doctor" ? "Doctor Portal" : user.role === "shop_owner" ? "Shop Dashboard" : "Admin Hub"}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => logout()}
                title="Sign Out"
                className="hidden sm:inline-flex rounded-full h-9 w-9 text-muted-foreground hover:text-destructive hover:border-destructive/30"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="rounded-full text-xs font-semibold px-3.5 h-9">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="rounded-full text-xs font-bold px-4 h-9 bg-primary hover:bg-primary/90 text-white shadow-xs"
              >
                <Link to="/register">
                  Doctor Register <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          )}

          {/* Mobile Navigation Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="lg:hidden rounded-full h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[310px] bg-background/98 backdrop-blur-2xl border-l border-border/80">
              <div className="flex flex-col gap-6 mt-6">
                <Logo />
                <div className="flex flex-col gap-1">
                  {links.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/70 space-y-1.5 text-xs">
                  <div className="font-extrabold text-foreground">Darsh Dental Depot</div>
                  <div className="text-muted-foreground text-[11.5px] leading-relaxed">
                    Vraj Vihar Complex, Near Khanderao Market, Shiyabaug, Vadodara
                  </div>
                  <a
                    href="tel:+919727076119"
                    className="text-primary font-bold flex items-center gap-1.5 pt-1 text-xs"
                  >
                    <Phone className="h-3.5 w-3.5" /> +91 97270 76119
                  </a>
                </div>

                <div className="h-px bg-border/60 my-1" />

                {isAuthenticated && user ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-xs text-muted-foreground px-4">
                      Doctor: <span className="font-bold text-foreground">{user.fullName}</span>
                    </div>
                    <Button asChild className="rounded-xl justify-start bg-primary text-white font-bold">
                      <Link to={getDashboardPath()}>
                        <LayoutDashboard className="h-4 w-4 mr-2" /> Open Portal
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={() => logout()} className="rounded-xl justify-start text-destructive">
                      <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Button variant="outline" asChild className="rounded-xl justify-center font-bold">
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button asChild className="rounded-xl justify-center bg-primary text-white font-bold shadow-xs">
                      <Link to="/register">Doctor Registration</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
