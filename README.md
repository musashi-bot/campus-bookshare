# 📚 Campus BookShare

> A peer-to-peer novel rental platform built for college students. Students lend their read novels to campus peers, while the platform acts as a trusted middleman that matches readers, tracks due dates, sends automatic reminders, and enables offline payment verification.

---

## 🎨 Theme & Brand Identity
- **Primary / Buttons / Headers:** Ink Navy (`#1F2A44`)
- **Background:** Paper Cream (`#FAF6EE`)
- **Accent / Highlights / CTAs:** Warm Amber (`#E9A23B`)
- **Success (Returned, Paid, Verified):** Teal (`#2A9D8F`)
- **Warning / Overdue:** Terracotta (`#D96C4A`)
- **Text:** Charcoal (`#2B2B2B`)
- **Fonts:** **Outfit** (headings, casual and friendly) & **Plus Jakarta Sans** (clean, highly readable on mobile screens)

---

## 🛠 Tech Stack
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database, Auth & Storage:** [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Email Service:** [Resend](https://resend.com/) (falls back to console logging when no key is set)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)
- **Deployment Target:** [Vercel](https://vercel.com/)

---

## 🔑 Environment Variables & Where to Add API Keys

Create a file named **`.env.local`** in the root of your project (or copy from [`.env.example`](.env.example)):

```bash
# -------------------------------------------------------------
# 1. SUPABASE CONFIGURATION (Required for live cloud database)
# -------------------------------------------------------------
# Get these from: Supabase Dashboard -> Project Settings -> API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...your-service-role-key

# -------------------------------------------------------------
# 2. OFFLINE UPI CONFIGURATION (Required for campus payments)
# -------------------------------------------------------------
# Your campus handover UPI VPA ID (shown on payment screens)
NEXT_PUBLIC_UPI_ID=campusshare@oksbi

# -------------------------------------------------------------
# 3. EMAIL REMINDERS (Resend API - Optional)
# -------------------------------------------------------------
# Get from https://resend.com/api-keys
# If left blank or omitted, emails will cleanly log to console in development!
RESEND_API_KEY=re_your_resend_api_key_here

# -------------------------------------------------------------
# 4. DAILY CRON SECRET (Protects /api/cron/reminders)
# -------------------------------------------------------------
# Any random secure string of your choice
CRON_SECRET=campus_share_cron_secret_2026

# -------------------------------------------------------------
# 5. APP URL
# -------------------------------------------------------------
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Step-by-Step Setup Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Your Supabase Project
1. Log in to [Supabase](https://supabase.com/) and click **"New Project"**.
2. Note your **Project URL**, **Anon Key**, and **Service Role Key** under **Settings -> API**.
3. Open the **SQL Editor** in your Supabase dashboard and run the schema migration:
   - Copy the contents of [`supabase/migrations/20261031_initial_schema.sql`](supabase/migrations/20261031_initial_schema.sql) and execute it.
4. In the SQL Editor, run the seed script to populate default settings, test users, and 15 popular novels across genres:
   - Copy the contents of [`supabase/seed.sql`](supabase/seed.sql) and execute it.
5. In **Storage**, verify that a public bucket named **`book-covers`** is present (the SQL migration creates it automatically).

### 3. Creating the Admin User
To assign admin privileges to a user:
1. Sign up through the app at `/signup` with an email (e.g. `admin@campusshare.internal`).
2. In Supabase Dashboard -> **Table Editor** -> `profiles`, change the `role` column of that user from `'student'` to `'admin'`.
3. The user can now access the full Admin Operations Console at `/admin`.

*(Note: In local demo mode, the account `admin@campusshare.internal` is pre-configured with admin rights).*

### 4. Run the App Locally
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Run Unit Tests
To verify the fee calculations, late fee splitting, and active limits logic:
```bash
npm test
```

### 6. Testing the Daily Reminder Cron Job Locally
The cron job endpoint is located at `/api/cron/reminders` and checks active rentals for due dates and overdue accruals.

To trigger it locally with your `CRON_SECRET`:
```bash
curl -H "Authorization: Bearer campus_share_cron_secret_2026" http://localhost:3000/api/cron/reminders
```

---

## 🚢 Deploying to Vercel

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your repository.
4. Under **Environment Variables**, paste all the keys from your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_UPI_ID`
   - `CRON_SECRET`
   - `RESEND_API_KEY` (if using Resend)
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL)
5. Click **Deploy**.
6. **Scheduled Cron Job on Vercel:**
   - In your `vercel.json`, you can configure a daily cron trigger to call `/api/cron/reminders` every morning at 8:00 AM IST.

---

## 📐 Architecture & Key Features

| Route | Feature |
| :--- | :--- |
| `/` | Live search, thumb-scrollable novel genre chips, condition & price filters, novel grid |
| `/books/[id]` | High-res cover gallery, lender profile & rating, specs, interactive price breakdown, rent request box |
| `/books/new` | Lend a novel with Zod validation, cover photo upload, starts as "Pending" until approved |
| `/dashboard` | Borrowed, Lent, My Listings, and History tabs, phone privacy, due countdowns, earnings summary, Campus BookShare Plus banner |
| `/rentals/[id]/payment` | Offline UPI QR, copyable UPI ID, UTR transaction reference submission |
| `/admin` | Metrics overview, listing approvals, payment confirmations, book return inspection, payouts, fee rule settings, CSV export |
| `/api/cron/reminders` | Automated daily reminder job (due in 2 days, due today, daily overdue alerts with late fees) |

---

## 📄 License
MIT License. Built for student novel lovers.

