/* eslint-disable @next/next/no-html-link-for-pages -- The storefront route handlers serve standalone HTML documents. */
import { Logo } from "./Navbar";

export function Footer() {
  return (
    <footer className="depot-footer">
      <Logo />
      <nav aria-label="Footer navigation">
        <a href="/products">Catalog</a>
        <a href="/brands">Brands</a>
        <a href="/location">Depot location</a>
        <a href="/contact">Contact</a>
        <a href="/login">Doctor portal</a>
      </nav>
      <small>© {new Date().getFullYear()} Darsh Dental Depot</small>
    </footer>
  );
}
