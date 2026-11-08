# Darsh Dental Depot

Website, doctor portal and depot dashboards for Darsh Dental Depot, Vadodara.
Built with **Next.js 16 (App Router)**, **Supabase** (database, auth, storage), Tailwind CSS 4 and Razorpay.

## Project layout

npm workspaces with two folders. It runs as **one Next.js app**: the frontend serves the
pages and its `/api` routes call into the backend package.

```
Backend/                        # @darsh/backend: server-side logic + database
├── src/
│   ├── config.ts               # Supabase URL + publishable key (shared)
│   ├── chat/gemini.ts          # AI chatbot (Gemini proxy)
│   ├── email/otp.ts            # Login OTP emails (Resend / Brevo / SMTP)
│   ├── payments/razorpay.ts    # Razorpay order creation + verification (+ tests)
│   ├── security/rate-limit.ts  # Per-IP rate limiting
│   └── site-content/           # Website content: rendering, defaults, live catalog, staff auth
└── supabase/                   # SQL migrations, run in order (01 → 04)

Frontend/                       # Next.js 16 app (UI + thin route handlers)
├── src/
│   ├── app/                    # Routes
│   │   ├── route.ts, products/, brands/, about/, location/, contact/
│   │   │                       #   Public marketing pages (dashboard-editable)
│   │   ├── login/ register/ forgot-password/ reset-password/
│   │   ├── products/[id]/      # Product detail
│   │   ├── doctor/ admin/ shop/  # Portals & dashboards
│   │   └── api/                # One-line wrappers over Backend/
│   ├── site/                   # Marketing page HTML templates (data-cms tags)
│   ├── views/                  # Client components for each app page
│   ├── components/             # UI, dashboard, chatbot, invoice components
│   └── lib/                    # Supabase client, API layer, utilities
├── public/site/assets/         # CSS, JS and images for the marketing pages
└── scripts/build-site-templates.mjs
```

## Website content (editable from the dashboard)

Admins and shop owners can edit the public website under **Dashboard → Website Content**:

- **Page text and images:** every heading, paragraph, label, statistic and image on the
  Home, Products, Brands, About, Location and Contact pages, plus each page's SEO title
  and description. Images can be uploaded (stored in Supabase Storage).
- **Contact details:** phone, WhatsApp number, hours, address, map search.
- **Lists:** product categories, brands, testimonials and FAQs.
- **Products:** the public catalog shows live products from the `products` table, managed
  in the Products section of the shop dashboard.

Saving publishes immediately. Any field can be restored to its original value.

How it works: editable elements in `src/site/*.html` carry a `data-cms="<key>"` attribute.
The page routes apply saved values from `site_content` before sending the HTML. To make a
new element editable, add a unique `data-cms` key to it (and `data-cms-type="image"` for
images); it appears in the editor automatically.

## Scripts

| Command (repo root) | Description |
| --- | --- |
| `npm run dev` | Development server on port 8080 |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint (Next.js + Prettier rules) |
| `npm test` | Backend payment/order logic tests |
| `npm run typecheck` | Type-check the backend package |
