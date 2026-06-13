import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShoppingCart, Sparkles, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { motion } from "framer-motion";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center shadow-sm group-hover:scale-105 transition-transform">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <div className="font-bold text-sm tracking-tight">Darsh Dental</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Depot</div>
      </div>
    </Link>
  );
}

export function Navbar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Logo />
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = l.to === "/" ? path === "/" : path.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  active ? "text-primary bg-primary/10" : "text-foreground/70 hover:text-foreground hover:bg-accent"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
            <Link to="/products"><ShoppingCart className="h-4 w-4" /></Link>
          </Button>
          <Button variant="outline" asChild className="hidden sm:inline-flex">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link to="/register">Get Started</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="md:hidden"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-1 mt-8">
                {links.map((l) => (
                  <Link key={l.to} to={l.to} className="px-3 py-2 rounded-md hover:bg-accent">
                    {l.label}
                  </Link>
                ))}
                <Link to="/login" className="px-3 py-2 rounded-md hover:bg-accent">Login</Link>
                <Link to="/register" className="px-3 py-2 rounded-md bg-primary text-primary-foreground">Get Started</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
