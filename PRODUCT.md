# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** Practicing dentists, dental surgeons, and clinic operators in Vadodara (Gujarat) managing clinical supply inventory, requiring reliable, fast procurement of authentic dental consumables, restorative composites, instruments, and equipment.
- **Internal / Operations:** Dental depot managers and administrators managing inventory stocks, batch tracking, HSN codes, GST invoicing, order fulfillment, and doctor verifications.

## Product Purpose

Eliminate clinic operatory downtime caused by supply shortages and uncertain material authenticity. Darsh Dental Depot provides dental practitioners with an immediate, verified, and transparent local supply conduit. Success is defined as a dentist or clinic assistant being able to reorder required clinical materials in under two minutes with guaranteed batch integrity, full GST compliance, and local dispatch.

## Positioning

Hyper-local trust, authenticity, and immediate accountability. Where national marketplaces suffer from multi-day transit times, third-party vendor opacity, and uncertain shelf-life handling, Darsh Dental Depot provides direct procurement from a recognized local dental depot in Vadodara, featuring 100% genuine manufacturer supplies, verifiable batch and expiry details, official GST invoicing, and direct WhatsApp/phone communication with depot staff.

## Operating Context

- **Usage Environments:** Fast-paced dental clinics, consultation desks, and operatory setups where orders are placed between patient procedures or during clinic closure hours on smartphones, tablets, or reception desktops.
- **Geography & Dispatch:** Vadodara, Gujarat (Alkapuri, Akota, Gotri, Old Padra Road, Manjalpur, Karelibaug, Fatehgunj, Vasna-Bhayli, etc.) with local same-day/next-day dispatch, complemented by regional clinic shipping.
- **Communication & Ordering Channels:** Self-service web portal with synced cart and order history, backed by direct one-tap WhatsApp order queries and emergency supply hotline (+91 97270 76119).

## Capabilities and Constraints

- **Confirmed Capabilities:**
  - Specialized dental catalog categorized by clinical disciplines (Restorative, Endodontics, Prosthodontics, Orthodontics, Periodontics, Instruments, Consumables).
  - Accurate batch number, manufacturer, and expiry date visibility on clinical supplies.
  - Transparent pricing with explicit HSN codes and GST percentages.
  - Doctor account portal with Medical Registration Number verification and clinic profile management.
  - Order lifecycle management, Razorpay digital payment integration, and downloadable GST invoices.
  - Administrative control over stock thresholds, low-stock alerts, and catalog management.
- **Technical Constraints:**
  - Full-stack web application: Frontend built on TanStack Start (SSR), React 19, TanStack Router, and Tailwind CSS; Backend on Node.js, Express, TypeScript, and MongoDB.
  - High reliability requirement on mobile viewports for busy on-the-go doctors.

## Brand Commitments

- **Name & Identity:** Darsh Dental Depot (DDD) & Glow Platform.
- **Tone & Voice:** Clinically competent, reliable, professional, honest, and accessible. Avoid generic consumer e-commerce hype or intrusive marketing jargon.
- **Anchors:** Physical depot presence in Vadodara, direct support via +91 97270 76119 and verified clinic dispatch networks.

## Evidence on Hand

- Complete running frontend codebase (`Frontend/src`) with full route structure: Public storefront, Products catalog, Doctor portal (`/doctor`), Admin panel (`/admin`), and Authentication flows.
- Functional backend API specifications, Mongoose models (`User`, `Product`, `Order`, `Invoice`, `Cart`), and seed datasets.
- Established local clinical geography coverage data and WhatsApp inquiry entry points.

## Product Principles

1. **Clinical Integrity First:** Authenticity, verifiable batch tracking, and manufacturer provenance take precedence over aggressive merchandising or discount popups.
2. **Frictionless Clinical Replenishment:** Design every interaction for high-speed scanning and minimal clicks; dentists reorder between procedures and require instant confirmation.
3. **Local Proximity as a Strategic Advantage:** Transparently display dispatch timelines, local availability, and direct human assistance for urgent clinic requirements.
4. **Total Price and Tax Clarity:** Display clear GST breakdowns, HSN codes, and delivery expectations up front—no hidden surcharges or surprise fees at checkout.

## Accessibility & Inclusion

- Target WCAG 2.1 AA accessibility standards across all device breakpoints.
- High-contrast typography and legible data tables tailored for fast scanning under bright clinical operatory lighting.
