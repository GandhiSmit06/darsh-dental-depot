# Darsh Dental Depot — Digital Design System Specification
**Version**: 2.0 (Cinematic & Editorial Medical Technology)  
**Brand Identity**: Darsh Dental Depot — Vadodara's Premier Dental Supplier  
**Creative Direction**: *"Dental Precision, Presented Like Premium Technology."*

---

## 1. Executive Brand & Design Vision

Darsh Dental Depot is transformed from a conventional ecommerce store into an **authoritative, clinical, editorial, and cinematic digital commerce experience**. 

The design combines:
- **Medical & Clinical Precision**: Clean structure, ultra-sharp typography, verified technical specifications, and authentic depot licensure.
- **Editorial Composition**: Asymmetrical layouts, expressive scale contrast, generous negative space, and curated product storytelling.
- **Cinematic Choreography**: Fluid scroll choreography, smooth spring transitions, layered depth, and tactile micro-interactions.
- **Commercial Trust**: Transparent pricing, live inventory status, same-day Vadodara dispatch alerts, and one-click Tally ERP GST Invoices.

### Anti-AI-Slop Directives
To ensure the interface feels crafted by world-class product designers and creative directors rather than an automated template generator:
- ❌ **No purple/pink AI gradients** or indiscriminate glowing borders on every card.
- ❌ **No floating decorative blur blobs** without UX purpose.
- ❌ **No repetitive, monotonous 3-column card grids** stacked section after section.
- ❌ **No fake statistics or fabricated testimonials**.
- ✅ **Bold, intentional typography scale** with generous white space and strong typographic hierarchy.
- ✅ **Dynamic visual rhythm**: Alternate dense technical data with open editorial statements.
- ✅ **Product-first presentation**: Present dental materials with studio clarity, batch numbers, HSN breakdown, and tactile physical presence.

---

## 2. Typography System

### Typefaces
- **Display & Headings**: `Outfit` (Google Fonts, weights: 500, 600, 700, 800, 900)  
  *Characteristics: Geometric precision, modern architectural character, clinical sharpness.*
- **Body, UI & Data**: `Plus Jakarta Sans` (Google Fonts, weights: 400, 500, 600, 700)  
  *Characteristics: Optimal legibility at small sizes, warm geometric curves, high x-height.*
- **Monospace / Numerical Data**: `JetBrains Mono` / `ui-monospace` (for HSN codes, GSTIN, Drug License, Order IDs, batch numbers).

### Scale & Hierarchy
| Token | Font Family | Size (px / rem) | Line Height | Tracking | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `display-2xl` | Outfit | 72px / 4.5rem | 1.02 | -0.04em | 900 | Cinematic Hero Headline |
| `display-xl` | Outfit | 56px / 3.5rem | 1.06 | -0.035em | 800 | Section Key Statements |
| `heading-1` | Outfit | 40px / 2.5rem | 1.12 | -0.03em | 800 | Page Titles & Hero Secondary |
| `heading-2` | Outfit | 28px / 1.75rem | 1.2 | -0.025em | 700 | Major Feature & Product Titles |
| `heading-3` | Outfit | 20px / 1.25rem | 1.3 | -0.02em | 600 | Card & Module Headers |
| `body-lg` | Plus Jakarta Sans | 18px / 1.125rem | 1.6 | -0.01em | 400/500 | Editorial Paragraphs & Lead Text |
| `body-base` | Plus Jakarta Sans | 15px / 0.9375rem | 1.55 | 0 | 400/500 | Standard Body & Product Descriptors |
| `body-sm` | Plus Jakarta Sans | 13px / 0.8125rem | 1.45 | 0.01em | 500/600 | UI Controls, Filters, Table Cells |
| `caption` | Plus Jakarta Sans | 11px / 0.6875rem | 1.4 | 0.04em | 700 (Uppercase) | Badges, Meta Tags, Depot Timestamps |
| `mono-data` | JetBrains Mono | 12px / 0.75rem | 1.4 | 0 | 600 | GSTIN, HSN, Order Numbers |

---

## 3. Color Palette & Material Architecture

The color strategy uses a **restrained clinical base with strategic surgical cyan/sapphire accents** and metallic slate neutrals.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                         │
│  Clinical Porcelain (#FCFDFE)  │  Obsidian Space (#060913)   │  Surgical Cyan (#0284C7) │
│  Light Ceramic Base            │  Dark Depth Base            │  Primary Brand Accent    │
│                                                                                         │
│  Dental Steel (#475569)        │  Medical Emerald (#059669)  │  Tally Amber (#D97706)   │
│  Neutral Typography            │  Verified Stock / In Stock  │  Tax / Licensure Accent  │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Color Tokens (Light Mode — "Platinum Ceramic & Clinical Cyan")
- **Background Base**: `#fcfdfe` (Ultra-pure ceramic white)
- **Subtle Surface / Section**: `#f4f7fb` (Soft clinical slate tint)
- **Elevated Card**: `rgba(255, 255, 255, 0.92)` with `1px solid rgba(226, 232, 240, 0.85)`
- **Primary Accent**: `#0284c7` (Surgical Cyan / Precision Medical Blue)
- **Primary Hover**: `#0369a1`
- **Text Main**: `#090e17` (Deep Obsidian Ink)
- **Text Secondary**: `#475569` (Clinical Slate)
- **Text Tertiary**: `#94a3b8` (Muted Steel)
- **Border / Divider**: `rgba(226, 232, 240, 0.8)`
- **Success / In Stock**: `#059669` (Emerald 600)
- **Warning / Drug License**: `#d97706` (Amber 600)

### Color Tokens (Dark Mode — "Obsidian Sapphire & Luminescent Steel")
- **Background Base**: `#060913` (Deep space obsidian)
- **Subtle Surface / Section**: `#0c1222` (Midnight navy tint)
- **Elevated Card**: `rgba(15, 23, 42, 0.65)` with `1px solid rgba(255, 255, 255, 0.08)`
- **Primary Accent**: `#38bdf8` (Luminescent Cyan)
- **Primary Hover**: `#7dd3fc`
- **Text Main**: `#f8fafc` (Pure White)
- **Text Secondary**: `#cbd5e1` (Silver Slate)
- **Text Tertiary**: `#64748b` (Deep Muted)
- **Border / Divider**: `rgba(255, 255, 255, 0.08)`
- **Success / In Stock**: `#10b981` (Emerald 500)

---

## 4. Spacing, Grid & Layout Principles

### Container Widths
- **Full Width Editorial**: `100vw` (hero statements, horizontal product rails)
- **Standard Container**: `max-w-7xl` (1280px)
- **Reading / Focused Container**: `max-w-4xl` (896px)
- **Auth / Modal Container**: `max-w-md` (448px)

### Visual Rhythm & Composition Structure
1. **Asymmetric Hero Section**: High-contrast headline + live depot telemetry chip paired with floating studio-lit product focal points.
2. **Editorial Statement Divider**: A massive, breathable statement section (e.g. *"Every restorative material. Every surgical burs. Dispatched from Siyabaug within 2 hours."*).
3. **Product Discovery Rail**: Dynamic horizontal scroll rail with tactile physics.
4. **Interactive Brand Matrix**: Minimalist typographic brand wall (Mani, 3M, Ivoclar, GC, Septodont, Dentsply).
5. **Trust & Depot Operations**: Transparent HSN breakdown, drug licenses (`GJ-VAD-215550`), and direct Vadodara delivery map.

---

## 5. Motion Tokens & Choreography System

### Animation Tokens (Framer Motion)
```ts
export const EASINGS = {
  editorial: [0.16, 1, 0.3, 1],       // Apple / Linear smooth deceleration
  snappy: [0.25, 1, 0.5, 1],          // Interactive buttons, pills, toggles
  bounce: [0.34, 1.56, 0.64, 1],      // Cart badge counters, floating chips
};

export const TRANSITIONS = {
  fast: { duration: 0.2, ease: EASINGS.snappy },
  normal: { duration: 0.45, ease: EASINGS.editorial },
  slow: { duration: 0.8, ease: EASINGS.editorial },
  stagger: 0.08,
};
```

### Motion Primitives
- **`RevealOnScroll`**: Smooth masked translation `(y: 32 -> 0, opacity: 0 -> 1)` on intersection.
- **`TextReveal`**: Line-by-line masked typography reveal for major hero headlines.
- **`ProductHoverTilt`**: Subtle 3D perspective tilt (max 4 degrees) on desktop hover with ambient specular glare.
- **`DynamicIslandPill`**: Smooth spring morphing navigation pill for tab switching.

---

## 6. Page-by-Page Architectural Blueprints

### 1. Navigation & Global Shell
- **Floating Dynamic Island Navbar**: Frosted glassmorphism (`backdrop-blur-2xl bg-background/80`) with active depot status badge (*"🟢 Siyabaug Depot Open — Same-Day Dispatch"*), global search trigger (`⌘K`), real-time cart indicator, and role-aware navigation.
- **Depot Ticker Header**: Subtle top banner displaying live exchange of dental materials, drug licensure info, and helpline shortcut.

### 2. Homepage (`/`)
- **Section 1 (Cinematic Hero)**: Bold editorial typography, live depot badge, interactive quick-search, and studio-grade dental material showcase.
- **Section 2 (Editorial Manifesto)**: Breathing room typography on clinical purity and Vadodara clinic delivery speed.
- **Section 3 (Interactive Dental Specialties)**: Editorial split-view for Composites, Diamond Burs, Impression, Endo & Sterilization.
- **Section 4 (Featured Clinical Supplies)**: Real API product rail with genuine Japanese Mani diamond burs and GC Fuji IX cements.
- **Section 5 (Manufacturer Ecosystem)**: Clean monochrome typography wall for certified global manufacturers.
- **Section 6 (Depot Logistics & Proof)**: Same-day Vadodara delivery map, drug licenses, IDBI bank wire trust, and Tally ERP GST compliance.
- **Section 7 (Doctor Reviews & Trust)**: Verified Vadodara clinic feedback and case usage.
- **Section 8 (Conversion CTA)**: Clean, high-contrast action portal for registering new clinic accounts or launching catalog search.

### 3. Product Catalog Listing (`/products`)
- **Split-Screen Search & Filters**: Floating filter drawer with price slider in INR, manufacturer checklists, and specialty categories.
- **High-Density Product Cards**: 100% real API data with live stock status, wholesale discount percentages, HSN indicators, and instant 1-click **Add to Cart**.
- **View Toggle**: Grid view & Dense Table / List view for bulk clinic ordering.

### 4. Product Detail Experience (`/products/$id`)
- **Studio Gallery**: Multi-image selector with zoom and clinical packaging views.
- **Technical Specification Sheet**: HSN code, GST rate, manufacturer country of origin, sterile packaging details.
- **Sticky Add-to-Cart Action Bar**: Instant quantity counter, total INR calculator, and direct Razorpay / COD purchase button.
- **Related Clinic Essentials**: Dynamic recommendation rail.

### 5. Doctor Operating Portal (`/doctor`)
- **Executive Clinic Telemetry**: Live order tracking with 4-stage stepper, instant **"📄 Download Tally GST Bill (PDF)"**, and saved clinic wishlist.
- **Fast Reorder System**: 1-click restock of previous month's restorative composites and burs.
- **Direct WhatsApp Dispatch**: 1-tap connection to Hetal Uncle with pre-populated order IDs.

### 6. Shop Owner Operating Portal (`/shop`)
- **Depot Command Center**: Pending packing dispatches, low stock restock alerts (< 5 units), and customer credit history viewer.
- **Tally Sales Bill Generator**: Exact computer-generated GST tax invoice printer matching IDBI bank format.
- **WhatsApp Dispatch Dispatcher**: 1-click notification trigger sending tracking details to Vadodara doctors.

### 7. Authentication Suites (`/login`, `/register`, `/forgot-password`)
- **Split-Screen Editorial Auth**: High-contrast branding visual on one half, crisp input fields with OTP toggle on the other.
- **Clinic Address & Vadodara Locality Picker**: Fast onboarding for dental practices.

---

## 7. Accessibility & Performance Standards

- **WCAG 2.1 AA Compliance**: Minimum 4.5:1 contrast ratio across all text and UI controls.
- **`prefers-reduced-motion`**: Disables all transforms, parallax, and heavy transitions instantly, falling back to clean instant state changes.
- **Performance**: Zero blocking scroll listeners; all animations utilize hardware-accelerated CSS `transform` and `opacity`.
- **Keyboard Navigation**: Full focus ring visibility with `focus-visible:ring-2 ring-primary`.

---
*Created & Approved for Darsh Dental Depot.*
