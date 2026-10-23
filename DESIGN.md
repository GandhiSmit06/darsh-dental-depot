---
name: Darsh Dental Depot & Glow Platform
description: Clinical precision dental supply depot and operatory replenishment design system
colors:
  primary: "#0284c7"
  primary-dark: "#12A488"
  accent: "#e0f2fe"
  accent-dark: "#3FD1B3"
  neutral-bg: "#f8fafc"
  neutral-bg-dark: "#070B0A"
  neutral-fg: "#0f172a"
  neutral-fg-dark: "#F2F6F4"
  card-bg: "rgba(255, 255, 255, 0.85)"
  card-bg-dark: "#0A100F"
  border: "rgba(226, 232, 240, 0.8)"
  border-dark: "rgba(255, 255, 255, 0.10)"
  muted: "#f1f5f9"
  muted-dark: "#0B1210"
  muted-fg: "#64748b"
  muted-fg-dark: "#9DB0A9"
  success: "#10b981"
  warning: "#f59e0b"
  destructive: "#ef4444"
typography:
  display:
    fontFamily: "Outfit, Plus Jakarta Sans, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Outfit, Plus Jakarta Sans, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Outfit, Plus Jakarta Sans, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.05em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "16px"
  xl: "20px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "#0369a1"
  button-secondary:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
---

# Design System: Darsh Dental Depot & Glow Platform

## Overview

**Creative North Star: "The Clinical Luminary"**

The visual language of Darsh Dental Depot reconciles medical sterileroom precision with modern, high-speed digital replenishment. It reflects the atmosphere of a top-tier operatory: immaculate hygiene, zero ambiguity, high-legibility typographic calibration, and authoritative authenticity. Surfaces are crisp, modern, and clinical without becoming cold or sterile.

The experience operates in two intentional modes: a daylight clinic mode defined by pristine slate surfaces and cerulean accents (`#0284c7`), and a specialized dark operatory mode defined by obsidian backgrounds (`#070B0A`), emerald dark card gradient layers (`#10201C` to `#0A100F`), and vivid bio-luminescent mint accents (`#12A488` / `#3FD1B3`).

**Key Characteristics:**
- **Dual-State Clinical Identity:** Seamless transition from daytime procurement clarity to deep, high-contrast dark operatory work.
- **Layered Glass & Ambient Depth:** 16px frosted card backdrops with crisp 1px borders and targeted luminescent hover cues.
- **High-Density Legibility:** Distinctive display typography via Outfit paired with ultra-legible, tabular-capable body text via Plus Jakarta Sans.
- **Uncompromised Traceability:** Product provenance—batch numbers, expiry dates, HSN codes, and regulatory badges—takes visual priority over decorative flair.

## Colors

The palette balances clean medical trustworthiness with vivid restorative energy across dual light and dark runtime states.

### Primary
- **Cerulean Sky (Light)** (`#0284c7`): Primary CTA, focus states, and primary clinical category markers in daylight view.
- **Clinical Mint Glow (Dark)** (`#12A488` / `#3FD1B3`): Primary high-contrast action color and active status indicators in dark operatory mode.

### Secondary
- **Deep Cyan Accent** (`#06b6d4` / `#0369a1`): Used for clinical specialty subheadings, badges, and secondary informative callouts.
- **Operatory Emerald** (`#10b981`): Stock availability confirmation, verified batch badges, and instant checkout verification.

### Neutral
- **Clean Slate Background** (`#f8fafc`): Light mode baseline canvas providing soft, glare-free optical comfort.
- **Obsidian Onyx Background** (`#070B0A`): Dark mode baseline canvas designed for low-light operatory settings.
- **Slate Text** (`#0f172a`): High-contrast primary reading color for descriptions and clinical data.
- **Mint-White Text** (`#F2F6F4`): High-contrast dark mode reading color minimizing eye fatigue.
- **Card Substrates:** `rgba(255, 255, 255, 0.85)` in light mode; `linear-gradient(135deg, #10201C 0%, #0A100F 100%)` in dark mode.
- **Subtle Borders:** `rgba(226, 232, 240, 0.8)` in light mode; `rgba(255, 255, 255, 0.10)` in dark mode.

### Named Rules
**The Clinical Provenance Rule.** Batch numbers, manufacturer origin, expiry status, and GST/HSN identifiers must appear with primary optical contrast on all product cards and order receipts—never subordinated or hidden inside collapsed accordions.

## Typography

**Display Font:** Outfit (fallback: sans-serif)
**Body Font:** Plus Jakarta Sans (fallback: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif)
**Label/Mono Font:** Plus Jakarta Sans with `tabular-nums` enabled

**Character:** Technical medical authority meets swift readability. Outfit brings sculptured geometric confidence to section headlines, while Plus Jakarta Sans delivers surgical clarity for drug names, dental material specifications, and batch dates.

### Hierarchy
- **Display** (700, `clamp(2rem, 5vw, 3.5rem)`, 1.15): Hero marketing titles, catalog milestones, and main portal entry titles.
- **Headline** (600, `clamp(1.5rem, 3vw, 2.25rem)`, 1.25): Category headlines, dashboard summary cards, and modal headers.
- **Title** (600, `1.25rem`, 1.35): Product names, clinic order titles, and card headers.
- **Body** (400, `0.9375rem`, 1.6): Clinical product descriptions, application steps, and general documentation (max line length ~70ch).
- **Label** (600, `0.75rem`, 1.2, uppercase, 0.05em tracking): SKU numbers, HSN codes, batch identifiers, status badges, and table column headers.

### Named Rules
**The Tabular Precision Rule.** All quantities, stock counts, batch IDs, and currency amounts in tables or cards must render with monospace/tabular numeric figures (`font-variant-numeric: tabular-nums`) to prevent optical jitter.

## Layout

The spatial model uses an 8px base rhythm with flexible responsive containers.
- **Page Containers:** Max width `1400px` centered with fluid gutter padding (`px-4 sm:px-6 lg:px-8`).
- **Product Grid:** 12-column responsive grid (1 column mobile, 2 columns tablet, 3-4 columns desktop, 5-6 columns large depot dashboard).
- **Density:** Controlled high-density data views for doctor orders and inventory tables; relaxed density with breathable white space for product discovery and education.
- **Rhythm:** `4px` (tight token gap), `8px` (component internal), `16px` (card content gap), `24px` (grid spacing), `32px` to `64px` (section separators).

## Elevation & Depth

The system uses a hybrid model of layered glassmorphism, crisp translucent borders, and ambient bioluminescent glow rather than heavy drop shadows.

### Shadow Vocabulary
- **Card Rest:** `0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)` (light) / `0 8px 32px 0 rgba(0, 0, 0, 0.45)` (dark).
- **Card Hover:** `0 12px 30px -4px rgba(2, 132, 199, 0.15)` (light) / `0 12px 30px -4px rgba(18, 164, 136, 0.22)` (dark) with `translateY(-4px)`.
- **Glow Cyan / Mint (`.glow-cyan`):** `0 0 25px -5px rgba(6, 182, 212, 0.4)` (light) / `0 0 25px -5px rgba(63, 209, 179, 0.35)` (dark) on focal CTA buttons and active order indicators.
- **Glow Primary (`.glow-primary`):** `0 0 30px -5px rgba(2, 132, 199, 0.35)` (light) / `0 0 30px -5px rgba(18, 164, 136, 0.35)` (dark).

### Named Rules
**The Luminescent Focus Rule.** Ambient glow is reserved strictly for interactive state feedback and critical clinical status (e.g., active stock, confirmed order, instant WhatsApp checkout). Background cards and structural wrappers remain flat.

## Shapes

- **Border Radius Strategy:**
  - Base radius: `1rem` (16px, `--radius`).
  - Small elements (badges, buttons, inputs): `6px` to `8px` (`rounded-md`).
  - Cards & Containers: `12px` to `16px` (`rounded-xl`).
  - Hero banners & Modals: `20px` to `24px` (`rounded-2xl` / `rounded-3xl`).
- **Form Geometry:** Crisp rectilinear silhouettes softened by calibrated corner radii. No exaggerated pill buttons or organic blobs.
- **Glass Card Treatment:** 16px backdrop blur (`backdrop-filter: blur(16px)`), with 1px translucent perimeter stroke (`border: 1px solid var(--border)`).

## Components

### Buttons
- **Shape:** `rounded-md` (8px).
- **Primary:** Light: `bg-[#0284c7] text-white hover:bg-[#0369a1]`; Dark: `bg-[#12A488] text-[#04110E] hover:bg-[#3FD1B3] font-bold`. Subtle light sweep on hover via `.btn-shine`.
- **Secondary:** `bg-secondary text-secondary-foreground hover:bg-secondary/80`.
- **Outline:** `border border-input bg-background dark:border-white/10 dark:bg-[#0B1210] dark:text-[#F2F6F4] hover:bg-accent`.
- **Size Scale:** `sm` (h-8 px-3 text-xs), `default` (h-9 px-4 py-2 text-sm), `lg` (h-10 px-8 text-base).

### Cards / Containers
- **Corner Style:** `rounded-xl` (12px to 16px).
- **Substrate:** Light: `rgba(255, 255, 255, 0.85)` with blur; Dark: `linear-gradient(135deg, #10201C 0%, #0A100F 100%)`.
- **Border:** `1px solid rgba(226, 232, 240, 0.8)` (light) / `1px solid rgba(255, 255, 255, 0.10)` (dark).
- **Hover Lift:** Smooth `300ms cubic-bezier(0.16, 1, 0.3, 1)` transition with `translateY(-4px)` and cyan/mint border highlight.

### Badges & Chips
- **Style:** Compact `px-2.5 py-0.5 text-xs font-semibold rounded-md border`.
- **Variants:**
  - Default: Primary filled background for active category filters.
  - Secondary: Neutral slate fill for manufacturer or brand labels.
  - Success: Emerald tint for "In Stock" and "Verified Batch".
  - Destructive: Crimson tint for "Out of Stock" or "Near Expiry".

### Inputs & Selects
- **Style:** `h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm`.
- **Focus:** `focus-visible:ring-1 focus-visible:ring-ring` (light `#0284c7`, dark `#12A488`).
- **Dark Mode:** `dark:bg-[#0B1210] dark:border-white/10 dark:text-[#F2F6F4] dark:placeholder-[#9DB0A9]/60`.

### Navigation
- **Header:** Sticky frosted glass bar (`glass-card`, blur 16px) with brand mark, search trigger, category jump links, cart badge, and doctor auth status.
- **Mobile Menu:** Sheet slide-over with clean tap targets (minimum 44px) and direct WhatsApp support trigger.

## Do's and Don'ts

### Do:
- **Do** display verifiable batch numbers, HSN tax classifications, and expiry dates prominently on all clinical item cards.
- **Do** maintain sharp contrast ratios (minimum 4.5:1 for body copy, 7:1 for critical data tables) under intense clinical ambient lighting.
- **Do** use `tabular-nums` for prices, SKU codes, phone numbers, and inventory levels.
- **Do** keep animations snappy (150ms-300ms ease-out) to respect busy clinical procurement schedules.
- **Do** provide direct one-tap access to WhatsApp and emergency depot hotline (+91 97270 76119).

### Don't:
- **Don't** use generic consumer SaaS purple gradients, neon gaming flourishes, or playful cartoon teeth mascots.
- **Don't** hide critical shelf-life or manufacturer credentials behind hover tooltips or collapsed accordions.
- **Don't** introduce slow, jarring multi-second scroll hijacking or bloated 3D animations that delay ordering.
- **Don't** allow dark mode to degenerate into low-contrast muddy greys; preserve crisp obsidian backgrounds with bright clinical mint accents.
- **Don't** display fake countdown timers, artificial scarcity popups, or intrusive coupon spin wheels.
