# PaycheckBudget — Biweekly Budget Web Application

A production-ready biweekly budget planner that solves every common pain point with
existing budget templates. Built to accompany the Etsy Excel template product.

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 14, TypeScript, Tailwind CSS|
| Charts      | Recharts                            |
| Data fetching | TanStack Query (React Query)      |
| Auth        | Firebase (Email/Password + Google)  |
| Backend     | Express.js, TypeScript              |
| Security    | Helmet.js                           |
| Validation  | Zod (runtime type safety)           |
| Database    | Neon DB (serverless PostgreSQL)     |

## Features

- **True biweekly budgeting** — 26 pay periods per year, not monthly estimates
- **3-paycheck month detection** — flags the 2 bonus months automatically
- **Variable income** — enter actual paycheck amount each period
- **Dual income** — optional partner income per period
- **12 default categories** — clean, not overwhelming; add custom ones
- **Budget vs. actual** — bar chart shows overspending at a glance
- **Debt tracker** — balances, APR, payments, payoff progress
- **Savings goals** — target + progress bar per goal, contributions per paycheck
- **Guided onboarding** — 3-step setup wizard
- **Mobile-friendly** — bottom nav on mobile, sidebar on desktop
- **Firebase auth** — email/password with verification + Google OAuth + forgot password

## Project Structure

```
biweekly-budget/
├── server/          Express.js API + Neon DB
├── client/          Next.js dashboard
└── templates/       Static Excel template (for Etsy product)
```

## Quick Start

### 1. Set up Neon DB

1. Create a free project at [console.neon.tech](https://console.neon.tech)
2. Copy the connection string

### 2. Set up Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication → **Email/Password** and **Google**
3. Go to Project Settings → Service Accounts → **Generate new private key** (download JSON)
4. Go to Project Settings → Your apps → Add web app → copy config values

### 3. Configure environment variables

```bash
# Server
cp server/.env.example server/.env
# Fill in: DATABASE_URL, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY

# Client
cp client/.env.local.example client/.env.local
# Fill in all NEXT_PUBLIC_FIREBASE_* values
```

### 4. Run the database migration

```bash
cd server
npm install
npm run db:migrate
```

### 5. Start development servers

```bash
# Terminal 1 — API server (port 4000)
cd server && npm run dev

# Terminal 2 — Next.js app (port 3000)
cd client && npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Reference

All endpoints require `Authorization: Bearer <firebase-id-token>` header.

| Method | Path                              | Description                          |
|--------|-----------------------------------|--------------------------------------|
| POST   | /api/v1/users                     | Upsert user on first sign-in         |
| GET    | /api/v1/users/me                  | Get current user profile             |
| PATCH  | /api/v1/users/me                  | Update pay start date, onboarding    |
| GET    | /api/v1/periods?year=2026         | List all 26 periods for a year       |
| POST   | /api/v1/periods/generate          | Generate periods from pay_start_date |
| PATCH  | /api/v1/periods/:id               | Update income for a period           |
| GET    | /api/v1/categories                | List categories                      |
| POST   | /api/v1/categories                | Create custom category               |
| PUT    | /api/v1/allocations/period/:id    | Bulk-upsert budget allocations       |
| GET    | /api/v1/expenses?period_id=:id    | List expenses for a period           |
| POST   | /api/v1/expenses                  | Add expense                          |
| GET    | /api/v1/debts                     | List debt accounts                   |
| POST   | /api/v1/debts                     | Create debt account                  |
| POST   | /api/v1/debts/:id/payments        | Log a payment (reduces balance)      |
| GET    | /api/v1/savings                   | List savings goals                   |
| POST   | /api/v1/savings                   | Create savings goal                  |
| POST   | /api/v1/savings/:id/contributions | Log a contribution (adds to balance) |
| GET    | /api/v1/dashboard?year=2026       | All dashboard data in one query      |

## Verification Checklist

- [ ] Sign up → email verification email arrives → unverified user blocked from app
- [ ] Forgot password → reset email arrives
- [ ] Google OAuth → user row created in DB
- [ ] Generate periods → exactly 26 rows, exactly 2 flagged as `is_three_paycheck_month`
- [ ] `curl -I localhost:4000/health` → `X-Frame-Options`, `X-Content-Type-Options` headers present (Helmet)
- [ ] POST `/api/v1/expenses` with `{ amount: -50 }` → 422 Zod validation error
- [ ] Two user accounts → user B gets empty results, cannot access user A's data
- [ ] Budget $500 Groceries + log $350 actual → bar chart shows gap

## Excel Template

See `templates/TEMPLATE_INSTRUCTIONS.md` for the complete specification to build the
accompanying `.xlsx` file in Excel or Google Sheets to sell on Etsy.
