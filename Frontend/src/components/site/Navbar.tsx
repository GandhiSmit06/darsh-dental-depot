/* eslint-disable @next/next/no-html-link-for-pages -- The storefront route handlers serve standalone HTML documents. */
"use client";

import { usePathname } from "next/navigation";
import { Menu, Moon, Search, ShoppingBag, Sun, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/components/theme-provider";

const links = [
  ["/", "Home"],
  ["/products", "Products"],
  ["/brands", "Brands"],
  ["/about", "About"],
  ["/location", "Location"],
  ["/contact", "Contact"],
];

export function Logo({ className = "" }: { className?: string }) {
  return (
    <a href="/" className={`depot-logo ${className}`} aria-label="Darsh Dental Depot home">
      <img src="/site/assets/img/brand/logo-mark-64.png" width="40" height="40" alt="" />
      <span>
        <strong>Darsh</strong>
        <small>
          Dental Depot<span className="hidden sm:inline"> · Vadodara</span>
        </small>
      </span>
    </a>
  );
}

export function Navbar() {
  const path = usePathname();
  const { user, logout } = useAuth();
  const { toggle } = useTheme();
  const [menu, setMenu] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const portal =
    user?.role === "admin" ? "/admin" : user?.role === "shop_owner" ? "/shop" : "/doctor";
  useEffect(() => {
    if (!menu) return;
    function escape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenu(false);
        trigger.current?.focus();
      }
    }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [menu]);
  return (
    <header className="depot-header">
      <div className="depot-header-row">
        <Logo />
        <nav className="depot-nav" aria-label="Main navigation">
          {links.map(([href, label]) => (
            <a href={href} key={href} aria-current={path === href ? "page" : undefined}>
              {label}
            </a>
          ))}
          <form action="/products" className="flex items-center gap-2">
            <input
              className="w-32 rounded-full border px-3 py-2 text-xs"
              type="search"
              name="q"
              aria-label="Search catalog"
              placeholder="Search materials"
            />
            <button aria-label="Search">
              <Search size={16} />
            </button>
          </form>
        </nav>
        <div className="depot-actions">
          <a
            className="depot-tool"
            href={user?.role === "doctor" ? "/doctor?tab=cart" : "/products?order=open"}
            aria-label="Open order list"
          >
            <ShoppingBag size={18} />
          </a>
          <button className="depot-tool" onClick={toggle} aria-label="Toggle color theme">
            <Sun className="hidden dark:block" size={18} />
            <Moon className="dark:hidden" size={18} />
          </button>
          <a
            className="depot-tool depot-signin"
            href={user ? portal : "/login"}
            aria-label={user ? "Open dashboard" : "Sign in"}
          >
            <UserRound size={18} />
          </a>
          {user ? (
            <button onClick={() => void logout()} className="depot-action">
              Sign out
            </button>
          ) : (
            <a href="/register" className="depot-action">
              Register clinic
            </a>
          )}
          <button
            className="depot-tool depot-menu-button"
            ref={trigger}
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            aria-controls="depot-menu"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menu && (
        <nav id="depot-menu" className="depot-menu" aria-label="Mobile navigation">
          <form action="/products">
            <input
              name="q"
              type="search"
              aria-label="Search catalog"
              placeholder="Search materials"
            />
            <button type="submit" aria-label="Search">
              <Search size={18} />
            </button>
          </form>
          {links.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
          <a href={user ? portal : "/login"}>{user ? "Open dashboard" : "Sign in to the portal"}</a>
        </nav>
      )}
    </header>
  );
}
