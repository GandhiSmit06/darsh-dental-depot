import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Darsh Dental Depot — Premium Dental Materials Supplier",
  description:
    "Trusted supplier of premium dental materials, instruments and supplies for clinics and professionals across India.",
  icons: {
    icon: "/site/assets/img/brand/logo-mark-192.png",
    apple: "/site/assets/img/brand/logo-mark-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Apply the saved theme before first paint.
const bootScript = `(function(){try{var d=document.documentElement,t=localStorage.getItem('theme'),dark=t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);d.classList.toggle('dark',dark);d.style.colorScheme=dark?'dark':'light';}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800;900&family=Manrope:wght@300;400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
