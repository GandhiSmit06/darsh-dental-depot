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
  User,
  SlidersHorizontal,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { LiquidToggle, NimbusToggleIcons } from "@/components/ui/liquid-glass-toggle";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { useAuth } from "@/lib/auth-context";
import { doctorApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/products", label: "Brands" },
  { to: "/about", label: "About Depot" },
  { to: "/contact", label: "Vadodara Location" },
  { to: "/contact", label: "Contact" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" data-magnetic data-magnetic-shape="rounded" className={`flex items-center gap-2.5 group select-none shrink-0 ${className || ""}`}>
      <div className="relative shrink-0">
        <div className="h-9 w-9 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-sky-200/80 dark:border-slate-700 shadow-xs flex items-center justify-center p-1 group-hover:border-sky-400 transition-colors">
          <svg className="w-6 h-6 text-[#0284c7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8 2 5 4.5 5 8c0 3.5 2 7 3.5 11 .5 1.5 1.5 3 3.5 3s3-1.5 3.5-3C17 15 19 11.5 19 8c0-3.5-3-6-7-6z" />
            <path d="M9 8c0-1.5 1.3-2.5 3-2.5s3 1 3 2.5" />
          </svg>
        </div>
      </div>
      <div className="leading-tight flex flex-col justify-center">
        <span className="font-extrabold text-[15px] tracking-tight font-heading text-slate-900 dark:text-white group-hover:text-[#0284c7] transition-colors">
          DARSH DENTAL
        </span>
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#0284c7]">
          DEPOT • VADODARA
        </span>
      </div>
    </Link>
  );
}

export function Navbar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [navSearch, setNavSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      try {
        const count = doctorApi.getCartCount();
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    updateCount();

    window.addEventListener("ddd_cart_updated", updateCount);
    window.addEventListener("storage", updateCount);

    return () => {
      window.removeEventListener("ddd_cart_updated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate({ to: "/products", search: { search: navSearch.trim() } as any });
    } else {
      navigate({ to: "/products" });
    }
  };

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
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 border-b border-slate-200/70 dark:border-slate-800/80 bg-white/95 dark:bg-[#070B0A]/95 backdrop-blur-md shadow-xs"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3 lg:gap-4">
        {/* Left: Brand Logo */}
        <Logo />

        {/* Center: Clean Nav Pills (matching mockup) */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((l, index) => {
            const isHome = l.to === "/" && l.label === "Home";
            const active = isHome ? path === "/" : path === l.to;
            return (
              <Link
                key={`${l.label}-${index}`}
                to={l.to}
                data-magnetic
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                  active
                    ? "bg-sky-100 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-300 font-bold"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Search input in header (matching mockup) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center relative max-w-xs lg:max-w-sm w-full mx-2"
        >
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search for products, brands or categories..."
              className="w-full h-9 pl-9 pr-8 text-xs rounded-full bg-slate-100/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/30 focus:border-[#0284c7] transition-all"
            />
            <button
              type="button"
              onClick={() => navigate({ to: "/products" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              title="Filters"
            >
              <SlidersHorizontal className="h-3 w-3" />
            </button>
          </div>
        </form>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Cart Icon with Dynamic Count Badge */}
          <Link
            to={isAuthenticated && user?.role === "doctor" ? "/doctor" : "/products"}
            data-magnetic
            data-magnetic-shape="circle"
            className="relative p-2 rounded-full text-slate-700 dark:text-slate-300 hover:text-[#0284c7] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={cartCount > 0 ? `Clinic Cart (${cartCount} item${cartCount > 1 ? "s" : ""})` : "Clinic Cart (Empty)"}
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-[#0284c7] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Liquid Glass Theme Toggle */}
          <div className="flex items-center rounded-full" data-magnetic data-magnetic-shape="pill">
            <LiquidToggle
              size={26}
              tone={theme === "dark" ? "dark" : "light"}
              checked={theme === "dark"}
              onCheckedChange={(isDark) => setTheme(isDark ? "dark" : "light")}
              icons={{ off: NimbusToggleIcons.sun, on: NimbusToggleIcons.moon }}
              label="Toggle light / dark mode"
              className="hover:scale-105 active:scale-95 transition-transform"
            />
          </div>

          {/* Auth State */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                asChild
                data-magnetic
                data-magnetic-shape="pill"
                className="rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs px-3.5 h-8.5 shadow-xs"
              >
                <Link to={getDashboardPath()}>
                  <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
                  {user.role === "doctor" ? "Doctor Portal" : user.role === "shop_owner" ? "Shop" : "Admin"}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logout()}
                title="Logout"
                className="rounded-full h-8 w-8 text-slate-400 hover:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                data-magnetic
                data-magnetic-shape="pill"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#0284c7] transition-colors"
              >
                <User className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
              <Link to="/register" data-magnetic data-magnetic-shape="pill" className="inline-block">
                <InteractiveHoverButton
                  text="Doctor Register"
                  className="h-8.5 min-w-[136px] px-3.5 text-xs font-semibold"
                />
              </Link>
            </div>
          )}

          {/* Mobile Navigation Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="xl:hidden rounded-full h-8 w-8 text-slate-700 dark:text-slate-200">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-white dark:bg-[#070B0A] border-l border-slate-200 dark:border-slate-800">
              <div className="flex flex-col gap-5 mt-6">
                <Logo />
                
                {/* Mobile Search */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={navSearch}
                    onChange={(e) => setNavSearch(e.target.value)}
                    placeholder="Search dental depot..."
                    className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </form>

                <div className="flex flex-col gap-1">
                  {navLinks.map((l, idx) => (
                    <Link
                      key={`${l.label}-${idx}`}
                      to={l.to}
                      className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-sky-50 dark:hover:bg-slate-900 hover:text-[#0284c7] transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Darsh Dental Depot</div>
                  <div className="text-[11px] text-slate-500 leading-tight">
                    Shiyabaug / Kevdabaug, Vadodara
                  </div>
                  <a
                    href="tel:+919727076119"
                    className="text-xs text-[#0284c7] font-bold flex items-center gap-1.5 pt-1"
                  >
                    <Phone className="h-3.5 w-3.5" /> +91 97270 76119
                  </a>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

                {isAuthenticated && user ? (
                  <div className="flex flex-col gap-2">
                    <Button asChild className="rounded-xl justify-start bg-[#0284c7] text-white">
                      <Link to={getDashboardPath()}>
                        <LayoutDashboard className="h-4 w-4 mr-2" /> Open Dashboard
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={() => logout()} className="rounded-xl justify-start text-destructive">
                      <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" asChild className="rounded-xl justify-center text-xs">
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button asChild className="rounded-xl justify-center bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs">
                      <Link to="/register">Doctor Register</Link>
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
