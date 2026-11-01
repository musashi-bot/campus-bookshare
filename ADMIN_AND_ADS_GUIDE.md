# Campus BookShare: Admin Operations & Banner Customization Guide

This guide provides complete instructions on:
1. **Running Campus BookShare as an Administrator** (account elevation, accessing the dashboard, approving listings, confirming offline UPI payments, processing returns, managing lender payouts, and adjusting platform fees).
2. **Removing or Customizing Placeholder Advertisements and Promotional Banners** across the entire application.

---

## Table of Contents
- [Part 1: Running the Product as an Admin](#part-1-running-the-product-as-an-admin)
  - [1.1 How to Elevate an Account to Admin](#11-how-to-elevate-an-account-to-admin)
  - [1.2 Logging in & Accessing the Admin Console](#12-logging-in--accessing-the-admin-console)
  - [1.3 Route Security & Role-Based Access Control (RBAC)](#13-route-security--role-based-access-control-rbac)
  - [1.4 Step-by-Step Admin Operations](#14-step-by-step-admin-operations)
    - [A. Overview & Platform Health Metrics](#a-overview--platform-health-metrics)
    - [B. Moderating Novel Listings (Approve / Reject)](#b-moderating-novel-listings-approve--reject)
    - [C. Confirming Offline Payments (UPI QR / Cash)](#c-confirming-offline-payments-upi-qr--cash)
    - [D. Inspecting Returns & Auto-Payout Settlement](#d-inspecting-returns--auto-payout-settlement)
    - [E. Disbursing Lender Payouts](#e-disbursing-lender-payouts)
    - [F. Overdue Management & Daily Reminders](#f-overdue-management--daily-reminders)
    - [G. Dynamic Fee Configuration](#g-dynamic-fee-configuration)
    - [H. Exporting CSV Financial & Rental Reports](#h-exporting-csv-financial--rental-reports)
- [Part 2: Removing Placeholder Advertisements & Banners](#part-2-removing-placeholder-advertisements--banners)
  - [2.1 Banner 1: "Campus BookShare Plus" Upsell Banner (Student Dashboard)](#21-banner-1-campus-bookshare-plus-upsell-banner-student-dashboard)
  - [2.2 Banner 2: "Quick Test Accounts" Demo Box (Login Screen)](#22-banner-2-quick-test-accounts-demo-box-login-screen)
  - [2.3 Banner 3: Moderation Notice Banner (Lend a Novel Page)](#23-banner-3-moderation-notice-banner-lend-a-novel-page)
  - [2.4 Banner 4: "Meet at Campus Spots" Handover Notice (Footer)](#24-banner-4-meet-at-campus-spots-handover-notice-footer)
  - [2.5 Banner 5: Call-to-Action (CTA) Promotional Banner (Homepage)](#25-banner-5-call-to-action-cta-promotional-banner-homepage)
- [Part 3: SQL Cheat Sheet for Administrators](#part-3-sql-cheat-sheet-for-administrators)

---

# Part 1: Running the Product as an Admin

## 1.1 How to Elevate an Account to Admin

There are two primary ways to run Campus BookShare with full administrator privileges:

### Method A: Elevate Your Own Account via Supabase SQL Editor (Recommended)
If you have already signed up with your personal or student email (e.g. `abhrajitchowdhury2005@gmail.com`):

1. Open your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Select your project and click **SQL Editor** (`>_` icon on the far left).
3. Click **+ New query**, paste the following SQL, and click **Run**:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'abhrajitchowdhury2005@gmail.com';
   ```
4. Verify the role change:
   ```sql
   SELECT id, name, email, role, college FROM profiles WHERE email = 'abhrajitchowdhury2005@gmail.com';
   ```
   *(The `role` column should now show `admin`.)*

### Method B: Use the Pre-Seeded Internal Admin Account
When the database migration is seeded (`supabase/seed.sql`), an internal admin account is provisioned:
- **Email:** `admin@campusshare.internal`
- **Password:** `AdminPass123!`
- **Role:** `admin`

---

## 1.2 Logging in & Accessing the Admin Console

1. Navigate to your live deployment or local server:
   - **Production:** `https://campus-bookshare.vercel.app/login`
   - **Local:** `http://localhost:3000/login`
2. Enter your Admin email and password, then click **Sign In**.
3. **Automatic Redirection:** Because your profile has `role: 'admin'`, you will automatically be redirected directly to the **Admin Console** at `/admin`.
4. **Navbar Access:** When logged in as an administrator, the navigation bar at the top displays a dedicated **"Admin Panel"** link with a high-visibility amber `Admin` badge.

---

## 1.3 Route Security & Role-Based Access Control (RBAC)

The application enforces strict server-side protection in [`middleware.ts`](file:///home/abhrajit/Desktop/HS_course_project/middleware.ts):
- Any unauthenticated request attempting to open `/admin` is immediately redirected to `/login?redirect=/admin`.
- Any authenticated student account whose `role` is not equal to `'admin'` is automatically redirected back to the homepage (`/`).

---

## 1.4 Step-by-Step Admin Operations

The Admin Console (`/admin`) is divided into 7 functional tabs:

```
[Overview]  [Pending Listings]  [Verify Payments]  [Active Rentals]  [Overdue Books]  [Lender Payouts]  [Fee Settings]
```

### A. Overview & Platform Health Metrics
The **Overview** tab provides real-time financial and operational health counters:
- **Total Approved Novels:** Number of novels active in the campus library.
- **Active Rentals:** Novels currently with student borrowers.
- **Pending Approvals:** Newly submitted listings awaiting moderation.
- **Platform Commission Earned:** Net revenue accumulated from 10% rental commissions and flat ₹10 booking fees.
- **Security Deposits Held:** Total student deposits held in custody until novel returns.
- **Waitlist Interest:** Total clicks on the Campus BookShare Plus feature banner.

---

### B. Moderating Novel Listings (Approve / Reject)
To maintain campus catalog safety, all novels added by students on `/books/new` enter a `pending` moderation state.

1. In `/admin`, click the **Pending Listings** tab.
2. Review the listing details:
   - Book title, author, edition, and genre.
   - Front cover photograph uploaded by the student.
   - Condition notes (clean pages, minor spine crease, etc.).
   - Weekly rental rate (₹) and replacement value (₹).
   - Owner name, college domain verification badge, and phone number.
3. Actions:
   - Click **Approve Listing**: The book status changes to `available` and instantly becomes visible to all students on the homepage and catalog.
   - Click **Reject**: Deletes the listing or flags it back to the student.

---

### C. Confirming Offline Payments (UPI QR / Cash)
Because Campus BookShare operates on campus peer-to-peer handovers, payments are completed offline via UPI QR code (`campusshare@oksbi`) or cash handover:

1. When a lender accepts a rental request, the borrower submits their offline payment reference (e.g. UPI UTR number or cash receipt) on `/rentals/[id]/payment`.
2. In `/admin`, click the **Verify Payments** tab.
3. Inspect the pending transaction:
   - **Borrower & Lender Information:** Names, emails, and contact numbers.
   - **Novel Title & Duration:** Rental period in weeks.
   - **Payment Breakdown:** Rental fee + ₹10 Platform fee + Security deposit.
   - **Submitted UTR / Transaction Reference:** Borrower's 12-digit UPI reference ID.
4. Verify the incoming funds in your UPI app / bank statement.
5. Click **Confirm Payment Received**:
   - The rental status changes from `awaiting_payment` to `active`.
   - Contact exchange is unlocked for borrower and lender to coordinate handover.
   - An automated email notification is sent to both parties.

---

### D. Inspecting Returns & Auto-Payout Settlement
When a rental period concludes and the book is returned on campus:

1. In `/admin`, switch to the **Active Rentals** tab.
2. Locate the rental and click **Process Return**.
3. A return modal will appear requesting inspection details:
   - **Book Condition:** Inspect for torn pages, water marks, or severe spine damage.
   - **Admin Inspection Note:** Optional notes (e.g. *"Returned in pristine condition"*).
   - **Damage Deduction:** ₹0 if clean, or an appropriate deduction from the security deposit.
4. Click **Complete Return & Calculate Payout**:
   - The platform fee engine (`lib/fees.ts`) automatically calculates:
     $$\text{Lender Share} = \text{Total Rent} - 10\% \text{ Commission}$$
     $$\text{Lender Late Share} = 50\% \text{ of Accumulated Late Fees}$$
     $$\text{Total Payout} = \text{Lender Share} + \text{Lender Late Share}$$
   - The security deposit (minus damage deductions) is refunded to the borrower.
   - A payout record is automatically created in the **Lender Payouts** queue.

---

### E. Disbursing Lender Payouts
1. In `/admin`, click the **Lender Payouts** tab.
2. Review all pending disbursements:
   - Lender name and registered phone number / UPI ID.
   - Novel rented and completed rental period.
   - Net payout amount.
3. Open your UPI app (GPay / PhonePe / Paytm / SBI UPI) and transfer the payout amount to the student lender.
4. Click **Mark Disbursed** in the admin table to log the payout as completed with a timestamp.

---

### F. Overdue Management & Daily Reminders
1. In `/admin`, click the **Overdue Books** tab.
2. Any rental that has passed its `due_date` without return is highlighted in terracotta/red:
   - Shows days overdue and accumulated late fee (₹2/day default).
   - Displays borrower phone number for direct campus outreach.
3. **Manual Trigger:** Click **Send Email Reminder** to dispatch an urgent overdue alert.
4. **Automated Daily Cron:** The system automatically runs every day at 8:00 AM IST via `/api/cron/reminders` (configured in [`vercel.json`](file:///home/abhrajit/Desktop/HS_course_project/vercel.json) and authenticated via `CRON_SECRET`).

---

### G. Dynamic Fee Configuration
Administrators can fine-tune economics without touching code:

1. In `/admin`, click the **Fee Settings** tab.
2. Update any of the following variables:
   - **Platform Commission (%):** Default `10`
   - **Flat Booking Fee (₹):** Default `10`
   - **Daily Late Fee (₹):** Default `2`
   - **Grace Period / Free Extension (Days):** Default `2`
   - **Security Deposit Multiplier:** Default `2x` weekly rent
3. Click **Save Settings**. New fees apply immediately to all subsequent rental calculations.

---

### H. Exporting CSV Financial & Rental Reports
At the top right of the Admin Console, click **Export CSV Report**:
- Generates a downloadable `campus_bookshare_rentals.csv` file.
- Includes Rental IDs, Book Titles, Borrower Emails, Lender Emails, Start & End Dates, Rental Fees, Commission Collected, Deposits, and Statuses.
- Ready for audit in Microsoft Excel, Google Sheets, or campus club finance records.

---

# Part 2: Removing Placeholder Advertisements & Banners

The codebase contains a few placeholder banners used during early student interest testing and prototype demonstration. Follow the exact steps below to remove or customize them.

---

## 2.1 Banner 1: "Campus BookShare Plus" Upsell Banner (Student Dashboard)
This promotional banner advertises a theoretical `₹149/month` subscription on the student dashboard.

### File Location:
- [`app/dashboard/page.tsx`](file:///home/abhrajit/Desktop/HS_course_project/app/dashboard/page.tsx)
- [`components/dashboard/PremiumInterestBanner.tsx`](file:///home/abhrajit/Desktop/HS_course_project/components/dashboard/PremiumInterestBanner.tsx)

### How to Remove:
In [`app/dashboard/page.tsx`](file:///home/abhrajit/Desktop/HS_course_project/app/dashboard/page.tsx), locate line 28 and lines 169–170:

```tsx
// 1. Remove this import at line 28:
import { PremiumInterestBanner } from "@/components/dashboard/PremiumInterestBanner";

// 2. Remove or comment out these lines around line 169:
{/* Campus BookShare Plus Validation Banner */}
<PremiumInterestBanner userId={profile?.id} />
```

*Result: The dark gradient "Campus BookShare Plus" promotional banner is completely removed from the student dashboard.*

---

## 2.2 Banner 2: "Quick Test Accounts" Demo Box (Login Screen)
On `/login`, there is a helper box with quick-fill demo buttons (`Admin Demo`, `Rahul`, `Ananya`).

### File Location:
- [`app/login/page.tsx`](file:///home/abhrajit/Desktop/HS_course_project/app/login/page.tsx) (Lines 134–172)

### How to Remove:
In [`app/login/page.tsx`](file:///home/abhrajit/Desktop/HS_course_project/app/login/page.tsx), delete lines 134 to 172:

```tsx
{/* REMOVE THIS ENTIRE BLOCK: */}
{/* Demo Credentials Quick-Fill */}
<div className="p-3 bg-paper-warm rounded-xl border border-paper-border space-y-2 text-xs">
  <span className="font-bold text-charcoal flex items-center gap-1.5">
    <Shield className="w-3.5 h-3.5 text-amber" />
    Quick Test Accounts:
  </span>
  <div className="flex flex-wrap gap-1.5 pt-1">
    <button ...>Admin Demo</button>
    <button ...>Rahul (IITB)</button>
    <button ...>Ananya (DU)</button>
  </div>
</div>
```

*Result: The login page becomes a clean, production-ready student login screen with no prefilled demo credentials.*

---

## 2.3 Banner 3: Moderation Notice Banner (Lend a Novel Page)
On `/books/new`, an informative notice explains that newly listed books enter admin moderation before going live.

### File Location:
- [`app/books/new/page.tsx`](file:///home/abhrajit/Desktop/HS_course_project/app/books/new/page.tsx) (Lines 194–203)

### How to Remove:
If you want books to go live without showing this warning box, remove lines 194–203:

```tsx
{/* REMOVE OR EDIT THIS BLOCK: */}
{/* Moderation Notice Banner */}
<div className="p-4 rounded-2xl bg-paper-warm border border-paper-border flex items-start gap-3">
  <ShieldCheck className="w-5 h-5 text-amber shrink-0 mt-0.5" />
  <div className="text-xs space-y-0.5 text-charcoal/80">
    <p className="font-bold text-ink">Admin Moderation Notice</p>
    <p className="leading-relaxed">
      All newly listed books start in <span className="font-semibold text-amber">"Pending"</span> status until verified...
    </p>
  </div>
</div>
```

---

## 2.4 Banner 4: "Meet at Campus Spots" Handover Notice (Footer)
In the site footer on every page, there is a card reminding students to meet at campus spots and pay offline.

### File Location:
- [`components/layout/Footer.tsx`](file:///home/abhrajit/Desktop/HS_course_project/components/layout/Footer.tsx) (Lines 59–72)

### How to Remove:
In [`components/layout/Footer.tsx`](file:///home/abhrajit/Desktop/HS_course_project/components/layout/Footer.tsx), delete or replace lines 59 to 72:

```tsx
{/* REMOVE OR CUSTOMIZE THIS BLOCK: */}
<div className="space-y-2.5">
  <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-charcoal/80">
    Handover Tips
  </h4>
  <div className="p-3 bg-white rounded-xl border border-paper-border text-[11px] sm:text-xs text-charcoal/80 space-y-1.5">
    <p className="flex items-center gap-1.5 font-bold text-ink">
      <Bookmark className="w-3.5 h-3.5 text-amber shrink-0" />
      <span>Meet at Campus Spots</span>
    </p>
    <p className="leading-relaxed text-charcoal/70">
      Exchange books at library lobbies or student cafes. Pay via UPI QR or cash.
    </p>
  </div>
</div>
```

---

## 2.5 Banner 5: Call-to-Action (CTA) Promotional Banner (Homepage)
At the bottom of the home landing page (`/`), there is a wide promotional card encouraging students to lend their novels.

### File Location:
- [`app/page.tsx`](file:///home/abhrajit/Desktop/HS_course_project/app/page.tsx) (Lines 110–142)

### How to Remove or Customize:
In [`app/page.tsx`](file:///home/abhrajit/Desktop/HS_course_project/app/page.tsx), remove the entire section:

```tsx
{/* REMOVE THIS ENTIRE SECTION: */}
{/* Call to Action Section */}
<section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
  <div className="bg-ink rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 text-white ...">
    ...
  </div>
</section>
```

---

# Part 3: SQL Cheat Sheet for Administrators

Execute these commands in the **Supabase SQL Editor** whenever needed:

### Make Any User an Admin:
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'student@college.edu';
```

### Revoke Admin Access (Demote to Student):
```sql
UPDATE profiles
SET role = 'student'
WHERE email = 'student@college.edu';
```

### Manually Confirm an Email (Bypass Verification Links):
```sql
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'student@college.edu';
```

### Reset All Pending Listings to Approved (Bulk Verification):
```sql
UPDATE books
SET status = 'available'
WHERE status = 'pending';
```

### View Total Waitlist Subscribers for Campus BookShare Plus:
```sql
SELECT count(*) AS total_interested_students FROM premium_interest;
```

---

*Guide generated for Campus BookShare Novel Club. Keep this document updated when modifying fee formulas or platform moderation rules.*

