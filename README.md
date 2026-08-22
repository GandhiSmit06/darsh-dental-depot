# Darsh Dental Depot & Glow Platform

A modern, full-stack dental management and e-commerce platform built with React, TanStack Start, Node.js, Express, TypeScript, and MongoDB.

---

## 🏗️ Architecture Overview

The repository is structured as a clean full-stack workspace:

```
darsh-dental-glow/
├── Backend/                 # Express + TypeScript REST API
│   ├── docs/                # API specifications (Swagger/OpenAPI)
│   ├── logs/                # Application runtime logs (git-ignored)
│   ├── scripts/             # Database management & utility scripts
│   │   └── clear-db.js      # Utility script to wipe/reset database
│   ├── seeds/               # Initial seed data for products and users
│   │   └── seed.ts
│   ├── src/                 # Backend source code
│   │   ├── config/          # Environment & DB configurations
│   │   ├── controllers/     # Express route handlers
│   │   ├── helpers/         # JWT, bcrypt, mailer, invoice helpers
│   │   ├── interfaces/      # TypeScript data models & DTOs
│   │   ├── jobs/            # Scheduled background cron jobs
│   │   ├── middleware/      # Auth, RBAC, error, logger, rate-limiting
│   │   ├── models/          # Mongoose schemas (User, Product, Order, etc.)
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic layer
│   │   ├── types/           # Type definitions
│   │   ├── utils/           # ApiError, ApiResponse, asyncHandler, logger
│   │   ├── validators/      # Express-validator schemas
│   │   ├── app.ts           # Express application initialization
│   │   └── server.ts        # HTTP server entry point
│   ├── .env.example         # Template for environment variables
│   ├── package.json         # Backend dependencies and scripts
│   └── tsconfig.json        # TypeScript configuration for backend
│
├── Frontend/                # TanStack Start + Vite + React App
│   ├── src/
│   │   ├── components/      # UI, site, and dashboard components
│   │   │   ├── dashboard/   # Dashboard widgets & layouts
│   │   │   ├── site/        # Navigation, footers, public layout
│   │   │   └── ui/          # Radix UI + Tailwind primitives
│   │   ├── hooks/           # Custom React hooks (theme, mobile, toast)
│   │   ├── lib/             # API client, AuthContext, mock data, utils
│   │   │   ├── api.ts       # Centralized typed API client
│   │   │   ├── auth-context.tsx # Authentication provider & state
│   │   │   └── utils.ts     # Tailwind & class utilities
│   │   ├── routes/          # TanStack Router file-based routes
│   │   ├── router.tsx       # Router setup & query client binding
│   │   ├── server.ts        # SSR server entry point
│   │   ├── start.ts         # TanStack Start entry
│   │   └── styles.css       # Global styles & Tailwind design tokens
│   ├── package.json         # Frontend dependencies and scripts
│   ├── tsconfig.json        # TypeScript configuration for frontend
│   └── vite.config.ts       # Vite & TanStack configuration
│
├── .gitignore               # Comprehensive root gitignore rules
├── package.json             # Root monorepo orchestration scripts
└── README.md                # Project documentation
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** instance (local or Atlas)

### 2. Installation

Install dependencies for root and all sub-projects:

```bash
# From the repository root:
npm run install:all
```

### 3. Environment Configuration

Copy the example environment file in `Backend/` and configure your credentials:

```bash
cd Backend
cp .env.example .env
```

Ensure the following variables are configured in `Backend/.env`:
- `PORT` (default: 5000)
- `MONGO_URI` (MongoDB connection string)
- `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET`
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
- `CLOUDINARY_*` (for image uploads)
- `SMTP_*` (for email notifications)

---

## 🛠️ Available Scripts

### Root Scripts (Run from `darsh-dental-glow/` root)

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start both **Backend** (port 5000) and **Frontend** concurrently in dev mode |
| `npm run dev:backend` | Start only the Express backend development server with nodemon |
| `npm run dev:frontend` | Start only the Frontend development server with Vite |
| `npm run build` | Build both Backend and Frontend production bundles |
| `npm run build:backend` | Compile Backend TypeScript to `dist/` |
| `npm run build:frontend` | Build Frontend static/SSR production output |
| `npm run lint` | Run ESLint across both Backend and Frontend |
| `npm run install:all` | Install node modules for both Backend and Frontend |

### Backend Specific Scripts (Inside `Backend/`)

```bash
npm run dev        # Run with nodemon & ts-node
npm run build      # Compile TypeScript (tsc)
npm run start      # Run production build
npm run seed       # Seed database with initial products and data
npm run db:clear   # Reset / drop database
npm run lint       # Lint backend TypeScript files
```

### Frontend Specific Scripts (Inside `Frontend/`)

```bash
npm run dev        # Run Vite dev server
npm run build      # Build client & SSR assets
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run format     # Format with Prettier
```

---

## 📦 Tech Stack

- **Frontend**: React 19, TanStack Start, TanStack Router, TanStack Query, Tailwind CSS, Radix UI Primitives, Lucide Icons, Recharts, Sonner.
- **Backend**: Node.js, Express, TypeScript, Mongoose (MongoDB), Winston Logger, Helmet, Rate Limiter, Razorpay SDK, Nodemailer, Cloudinary.
- **Tooling**: Vite, TypeScript, ESLint, Prettier, Concurrently.
