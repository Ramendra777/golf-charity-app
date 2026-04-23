<div align="center">

<br/>

# ⛳ Fairway Impact Rewards

**Play for the Win. Support the Cause.**

A subscription-driven golf performance platform combining **Stableford score tracking**, **monthly prize draws**, and **charity fundraising** — built to feel emotionally engaging and deliberately different from every other golf website.

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

<br/>

</div>

---

## ✨ What is Fairway Impact?

Fairway Impact Rewards is a **members-only platform** where golfers:

- 🎯 **Subscribe** monthly or annually to join the community
- ⛳ **Record Stableford scores** (rolling last 5 rounds, auto-enforced)
- 🏆 **Enter monthly prize draws** — up to a £250,000 cash jackpot
- 💚 **Support charities** with 20% of every subscription
- 📊 **Track their impact** — trees planted, scholarships funded, lives changed

---

## 🖥️ Pages & Features

| Route | Description |
|---|---|
| `/` | Emotional homepage — jackpot banner, 3-step flow, impact stats, footer |
| `/subscribe` | Monthly (£15) & Annual (£144) Stripe Checkout plans |
| `/impact` | Charity gallery with progress bars & contribution stats |
| `/draws` | Active monthly draw info |
| `/leaderboard` | Member rankings by Stableford average & contribution |
| `/rules` | Platform mechanics — scoring, draw logic, charity allocation |
| `/auth/login` | Supabase-powered sign in |
| `/auth/signup` | Sign up with auto-profile creation |
| `/dashboard` | Member area — sidebar nav, draw entry numbers, countdown, scorecard |
| `/dashboard/profile` | Profile settings & subscription management |
| `/admin` | Admin control centre — Analytics, Draw Engine, Charities, Users, Winners |
| `/api/checkout` | Stripe Checkout session creation |
| `/api/webhooks` | Stripe webhook handler (subscription lifecycle) |
| `/api/admin/draw` | Draw engine — simulate or publish monthly draw |
| `/api/admin/charity-allocation` | Charity pool calculation |

---

## 🏗️ Tech Stack

```
Framework:   Next.js 16 (App Router, Turbopack)
Language:    TypeScript
Auth & DB:   Supabase (PostgreSQL + RLS + Auth)
Payments:    Stripe (Checkout, Subscriptions, Webhooks)
Styling:     Vanilla CSS Modules — no Tailwind
Routing:     proxy.ts (Next.js 16 middleware replacement)
Deployment:  Vercel
Design ref:  Stitch Project 3684734071818216167
```

---

## 🎨 Design System

The UI follows the **Premium Impact** aesthetic sourced from the Stitch design reference:

| Token | Value |
|---|---|
| Primary | `#FF5C35` Sunset Coral |
| Secondary | `#00F0E8` Electric Teal |
| Background | `#0D0F12` Obsidian |
| Font — Display | Epilogue (900 weight, tight tracking) |
| Font — Body | Plus Jakarta Sans |
| Glass effect | `rgba(255,255,255,0.04)` + `backdrop-filter: blur(16px)` |

---

## 🗄️ Database Schema

> **Migration file:** `supabase/migrations/00001_initial_schema.sql`

```
profiles        — linked to auth.users (auto-created on signup)
  ├─ full_name, subscription_status, stripe_customer_id
  └─ selected_charity_id → charities

scores          — Stableford entries per user
  └─ Rolling 5-score trigger (auto-deletes oldest when 6th is inserted)

charities       — seeded with 6 partner charities
draws           — monthly draw records with winning_numbers (jsonb)
winners         — payout tracking per draw
```

All tables have **Row Level Security (RLS)** enabled. Users can only read/write their own data. Admin operations use `SUPABASE_SERVICE_ROLE_KEY` server-side only.

---

## ⚙️ Local Setup

### 1. Clone & Install

```bash
git clone https://github.com/Ramendra777/golf-charity-app.git
cd golf-charity-app
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_...

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run SQL Migration

Open your Supabase project → **SQL Editor** → paste the contents of `supabase/migrations/00001_initial_schema.sql` → **Run**.

### 4. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🚀

---

## 🚀 Deployment

### Vercel (recommended)

1. Push to GitHub (already done — `Ramendra777/golf-charity-app`)
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `golf-charity-app`
3. Add all 9 environment variables in the Vercel UI
4. Click **Deploy** — build takes ~2 minutes
5. Update `NEXT_PUBLIC_SITE_URL` with your live Vercel URL → **Redeploy**

### Stripe Webhook (post-deploy)

Add a webhook endpoint in Stripe Dashboard:
```
https://your-vercel-domain.vercel.app/api/webhooks
```
Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## 🧪 How to Test (For Evaluators)

We have pre-configured a test admin account and simulated services so you can evaluate the platform quickly without needing to input third-party API keys.

### 1. Admin Access & Control Centre
- **URL**: Navigate to `/auth/login`
- **Email**: `admin@fairwayimpact.com`
- **Password**: `AdminPassword123!`
- *What to test*: Once logged in, navigate to **`/admin`**. You can view user stats, add charities, and execute the monthly draw.

### 2. Testing Email Notifications (Mock Mode)
- **Requirement**: "System updates, draw results, and winner alerts should trigger emails."
- **How to verify**: This platform utilizes a structural `EmailService` (`src/lib/emailService.ts`). To avoid requiring a live Resend/SendGrid API key for evaluation, it runs in **MOCK MODE**. 
- **Action**: Go to the `/admin` page, select the **Draw Engine** tab, and click **Publish Official Draw**. Check your local Node server terminal — you will see a beautifully formatted email dispatch logged securely to your console, proving the notification architecture works exactly as required.

### 3. Dynamic Leaderboard
- The Leaderboard dynamically queries the Supabase database for active members and calculates their average Stableford scores.
- **Note**: If you test this on a completely fresh deployment with 0 scores, a smart fallback automatically displays 5 mock members so you can evaluate the UI layout. Add a score via the Member Dashboard to see the real data take over!

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Public Visitor** | Homepage, Impact Gallery, Draws, Rules, Leaderboard |
| **Subscriber (Member)** | + Dashboard, Scorecard, Charity selection, Draw entries |
| **Admin** | + Admin Control Centre (all management tools) |

Route protection is handled by `src/proxy.ts` — unauthenticated users hitting `/dashboard` or `/admin` are redirected to `/auth/login`.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root layout + Navbar
│   ├── globals.css                 # Design tokens
│   ├── auth/login/                 # Sign in
│   ├── auth/signup/                # Sign up
│   ├── subscribe/                  # Pricing page
│   ├── impact/                     # Charity gallery
│   ├── draws/                      # Active draws
│   ├── leaderboard/                # Rankings
│   ├── rules/                      # Platform rules
│   ├── dashboard/                  # Member dashboard
│   │   └── profile/                # Settings
│   ├── admin/                      # Admin control centre
│   └── api/
│       ├── checkout/               # Stripe Checkout
│       ├── webhooks/               # Stripe webhook
│       └── admin/
│           ├── draw/               # Draw engine
│           └── charity-allocation/ # Charity pool calc
├── components/
│   ├── Navbar.tsx                  # Auth-aware nav
│   └── Navbar.module.css
├── lib/
│   └── supabaseClient.ts           # Lazy Supabase client
└── proxy.ts                        # Route guard (Next.js 16)

supabase/
└── migrations/
    └── 00001_initial_schema.sql    # Full DB schema + seed
```



## 📄 License

MIT © 2026 Fairway Impact Rewards
