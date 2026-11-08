# Darsh Dental Depot

Website, doctor portal and depot dashboards for Darsh Dental Depot, Vadodara.
Built with **Next.js 16 (App Router)**, **Supabase** (database, auth, storage), Tailwind CSS 4 and Razorpay.

## Project layout

```
Frontend/
├── src/
│   ├── app/                    # Next.js routes
│   │   ├── route.ts            # "/"  ─┐
│   │   ├── products/route.ts   #       │ Public marketing pages, rendered from
│   │   ├── brands/  about/     #       │ src/site/*.html with content edited in
│   │   ├── location/ contact/  #      ─┘ the dashboard (see "Website content")
│   │   ├── site-data.js/       # Catalog, brands, FAQs… for the marketing pages
│   │   ├── login/ register/ forgot-password/ reset-password/
│   │   ├── products/[id]/      # Product detail (React)
│   │   ├── doctor/ admin/ shop/  # Portals & dashboards (React)
│   │   └── api/                # chat, send-email-otp, razorpay, site-content
│   ├── site/                   # Marketing page HTML templates (data-cms tags)
│   ├── views/                  # Client components for each app page
│   ├── components/             # UI, dashboard, chatbot, invoice components
│   └── lib/                    # Supabase client, API layer, site content, payments
├── public/site/assets/         # CSS, JS and images for the marketing pages
├── supabase/                   # SQL migrations, run in order (01 → 04)
└── scripts/build-site-templates.mjs
```

## Getting started

```bash
cd Frontend
cp .env.example .env.local   # then fill in the values
npm install
npm run dev                  # http://localhost:8080
```

Root shortcuts also work: `npm run dev`, `npm run build`, `npm run lint` from the repository root.

### Database setup

Run the SQL files in `Frontend/supabase/` in the Supabase SQL editor, in order.
`04_site_content.sql` creates the `site_content` table and `site-media` storage bucket
used by the Website Content editor.

### Environment variables

See `Frontend/.env.example`. Summary:

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client (publishable key) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` | Online payments |
| `GEMINI_API_KEY` | AI chatbot (`/api/chat`); falls back to local replies if unset |
| `SMTP_*` (or `RESEND_API_KEY` / `BREVO_API_KEY`) | Login OTP emails |
| `RATE_LIMIT_WINDOW_MS`, `AUTH_RATE_LIMIT_MAX`, `CHAT_RATE_LIMIT_MAX` | Per-IP limits on OTP and chat |
| `LOW_STOCK_THRESHOLD` | Default "low stock" level in the public catalog |

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

## Scripts (in `Frontend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Development server on port 8080 |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint (Next.js + Prettier rules) |
| `npm run format` | Format with Prettier |
| `npm test` | Payment/order logic tests |
