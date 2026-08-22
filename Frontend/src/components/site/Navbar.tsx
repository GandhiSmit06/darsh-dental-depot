import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  ShoppingCart,
  Sparkles,
  Moon,
  Sun,
  LayoutDashboard,
  LogOut,
  User,
  ArrowRight,
  Shield,
  Heart,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products & Depot" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Support & Contact" },
];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-primary rounded-xl blur-sm opacity-60 group-hover:opacity-100 transition duration-300" />
        <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-sky-600 to-indigo-600 text-white grid place-items-center shadow-md transform group-hover:scale-105 transition-transform duration-300">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
      </div>
      <div className="leading-none flex flex-col">
        <span className="font-extrabold text-base tracking-tight font-heading bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent group-hover:to-cyan-500 transition-colors">
          DARSH DENTAL
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 mt-0.5">
          GLOW & DEPOT
        </span>
      </div>
    </Link>
  );
}

export function Navbar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "shop_owner") return "/shop";
    return "/doctor";
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 shadow-sm"
    >
      <div className="container mx-auto px-4 h-18 flex items-center justify-between gap-4">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-secondary/50 border border-border/40 backdrop-blur-md">
          {links.map((l) => {
            const active = l.to === "/" ? path === "/" : path.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  active
                    ? "text-primary font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-background rounded-full border border-primary/20 shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle with smooth rotation */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Toggle theme"
            className="rounded-full h-9 w-9 hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
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
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hidden sm:inline-flex rounded-full h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/80 relative"
          >
            <Link to="/products">
              <ShoppingCart className="h-4 w-4" />
            </Link>
          </Button>

          {/* Auth State Button */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                asChild
                className="hidden sm:inline-flex rounded-full shadow-md bg-gradient-to-r from-primary to-sky-600 hover:opacity-95 btn-shine font-medium text-xs px-4 h-9"
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
                title="Logout"
                className="hidden sm:inline-flex rounded-full h-9 w-9 text-muted-foreground hover:text-destructive hover:border-destructive/30"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="rounded-full text-xs font-medium px-4 h-9">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="rounded-full text-xs font-semibold px-5 h-9 bg-gradient-to-r from-primary via-sky-600 to-indigo-600 hover:opacity-95 shadow-md shadow-primary/20 btn-shine"
              >
                <Link to="/register">
                  Get Started <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          )}

          {/* Mobile Navigation Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="md:hidden rounded-full h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] glass-card border-l border-border/60">
              <div className="flex flex-col gap-6 mt-6">
                <Logo />
                <div className="flex flex-col gap-1.5">
                  {links.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-border/60 my-1" />

                {isAuthenticated && user ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-xs text-muted-foreground px-4">
                      Signed in as <span className="font-semibold text-foreground">{user.fullName}</span> ({user.role})
                    </div>
                    <Button asChild className="rounded-xl justify-start bg-primary text-white">
                      <Link to={getDashboardPath()}>
                        <LayoutDashboard className="h-4 w-4 mr-2" /> Open Dashboard
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={() => logout()} className="rounded-xl justify-start text-destructive">
                      <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Button variant="outline" asChild className="rounded-xl justify-center">
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button asChild className="rounded-xl justify-center bg-gradient-to-r from-primary to-indigo-600 text-white shadow-md">
                      <Link to="/register">Create Account</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
