/* eslint-disable @next/next/no-html-link-for-pages -- The storefront route handlers serve standalone HTML documents. */
import { defaultSettings } from "@darsh/backend/site-content/defaults";
import { Logo } from "./Navbar";

export function Footer() {
  return (
    <footer className="depot-footer">
      <div className="depot-footer-cta">
        <h2>Need a material urgently?</h2>
        <a
          href={`https://wa.me/${defaultSettings.phoneRaw}`}
          rel="noopener noreferrer"
          target="_blank"
        >
          WhatsApp the depot
        </a>
        <a href={`tel:+${defaultSettings.phoneRaw}`}>{defaultSettings.phone}</a>
      </div>
      <div className="depot-footer-main">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-white/75">{defaultSettings.address}</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="/products">Catalog</a>
          <a href="/brands">Brands</a>
          <a href="/about">About</a>
          <a href="/location">Depot location</a>
          <a href="/contact">Contact</a>
          <a href="/login">Doctor portal</a>
        </nav>
        <small>© {new Date().getFullYear()} Darsh Dental Depot</small>
      </div>
    </footer>
  );
}
