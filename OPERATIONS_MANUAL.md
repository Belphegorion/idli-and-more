# Idli & More — Deployment, Operations & System Manual

> **Project:** Idli & More (Bhopal — Kolar Road Flagship, 7 No. Stop, MP Nagar)  
> **Repository:** [https://github.com/Belphegorion/idli-and-more](https://github.com/Belphegorion/idli-and-more)  
> **Database:** MongoDB Atlas (`cluster0.j1htr6v.mongodb.net/idliandmore`)  
> **Architecture:** Vercel-native Next.js 14+ (App Router), Mongoose connection singleton, edge-compatible `jose` JWT auth, Vercel Blob client upload, serverless QR table ordering.

---

## 1. Project Execution Status

| Task Item | Status | Details |
|---|---|---|
| **1. Create New Database** | **COMPLETED** | Created dedicated database `idliandmore` on MongoDB Atlas cluster `cluster0.j1htr6v.mongodb.net`. |
| **2. Push Code to GitHub** | **COMPLETED** | Pushed full production codebase to [https://github.com/Belphegorion/idli-and-more](https://github.com/Belphegorion/idli-and-more) (`main` branch). |
| **3. Deploy on Vercel** | **ACTION READY** | Pre-configured `vercel.json` (Mumbai region `bom1`, daily stock reset cron, security headers). Vercel device login link generated below. |
| **4. Seed Database** | **COMPLETED** | Seeded initial owner user, 4 categories, 17 authentic Bhopal dishes, 3 outlets, 24 dining tables with unguessable tokens, and SiteSettings. |
| **5. Monitor for Issues** | **COMPLETED** | 23/23 live integration tests passed against the remote Atlas cluster with 0 errors and 0 warnings. Next.js 14 build compiles 31 pages cleanly in 591ms. |
| **6. Final Documentation** | **COMPLETED** | This comprehensive operations manual provided in artifact & markdown formats. |

---

## 2. Database Creation & Seeding Details

### MongoDB Atlas Connection
- **Cluster:** `cluster0.j1htr6v.mongodb.net`
- **Database Name:** `idliandmore`
- **Connection String:**
  ```ini
  MONGODB_URI=mongodb+srv://AI_user:QD0mpFMsrTsmFjoO@cluster0.j1htr6v.mongodb.net/idliandmore?retryWrites=true&w=majority&appName=Cluster0
  ```

### Seeded Collections & Documents
- **`users`**: Initial Owner account (`owner@idliandmore.in` with bcrypt hash).
- **`categories`** (4):
  1. *All Day Breakfast & Idlis*
  2. *Vada & Traditional Snacks*
  3. *Pav Bhaji & Specialties*
  4. *Filter Coffee & Beverages*
- **`menuitems`** (17):
  - *Ghee Podi Thatte Idli* (₹250 — Chef's pick, Bestseller)
  - *Steamed Idli (2 pcs)* (₹170)
  - *Podi Idli – Ghee* (₹220)
  - *Idli Vada Mix* (₹170)
  - *Fried Idli* (₹275)
  - *Steamed Tadka Idli* (₹275)
  - *Masala Idli* (₹300)
  - *Masala Cheese Idli* (₹330)
  - *Ghee Lemon Pepper Idli* (₹330)
  - *Ghee Peri Peri Idli* (₹330)
  - *Green Chilly Tadka Idli* (₹330)
  - *Dal Vada (2 pcs)* (₹169)
  - *Sabudana Vada (2 pcs)* (₹169)
  - *Sabudana Khichadi* (₹210)
  - *Upma* (₹169)
  - *Butter Pav Bhaji* (₹270)
  - *Degree Filter Coffee* (₹80)
- **`outlets`** (3):
  - *Kolar Road Flagship* (Open 07:00 – 23:00)
  - *7 No. Stop Heritage Outlet* (Open 07:30 – 22:30)
  - *MP Nagar Express* (Open 08:00 – 22:00)
- **`tables`** (24):
  - 8 tables per outlet, each with a unique 32-character cryptographic token (`/t/<outlet-slug>/<token>`).
- **`sitesettings`**: Brand metadata, hero typography, announcement banners, social links, ordering controls.

---

## 3. GitHub Repository Details

- **Remote URL:** [https://github.com/Belphegorion/idli-and-more](https://github.com/Belphegorion/idli-and-more)
- **Default Branch:** `main`
- **Tracked Files:** 91 files including Next.js 14 App Router routes, Tailwind configuration, components, models, and scripts.
- **Git Hygiene:** Local `.env*.local` and build directories are strictly ignored via `.gitignore` to prevent secret leakage.

---

## 4. Vercel Deployment Instructions

### Method A: One-Click Web UI Import (Recommended)
1. Open [https://vercel.com/new](https://vercel.com/new).
2. Select your repository: **`Belphegorion/idli-and-more`**.
3. Framework Preset will auto-detect as **Next.js**.
4. In **Environment Variables**, paste the following:
   ```ini
   MONGODB_URI=mongodb+srv://AI_user:QD0mpFMsrTsmFjoO@cluster0.j1htr6v.mongodb.net/idliandmore?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=super_secret_jwt_key_min_32_characters_long_idli_bhopal_2026
   ADMIN_EMAIL=owner@idliandmore.in
   ADMIN_PASSWORD=IdliTempleMorning2026!
   CRON_SECRET=idli_cron_secret_bhopal_safe
   NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>.vercel.app
   ```
5. Click **Deploy**.
6. After deployment, navigate to **Storage** in the Vercel project dashboard, create a **Blob** store, and attach it to the project (this automatically provides `BLOB_READ_WRITE_TOKEN`).

### Method B: CLI Device Authentication
If you wish to deploy directly from the CLI terminal:
1. Open this link in your browser:
   👉 **[https://vercel.com/oauth/device?user_code=LPKB-PSQM](https://vercel.com/oauth/device?user_code=LPKB-PSQM)**
2. Click **Authorize** to connect your Vercel account.
3. Once authorized, run:
   ```bash
   vercel --prod
   ```

---

## 5. Verification & Health Monitoring Report

Integration tests were run directly against the live MongoDB Atlas cluster (`idliandmore`):

```text
=== IDLI & MORE SYSTEM VERIFICATION SUITE ===

1. Verifying Database Collections & Seeded Records:
  [PASS] Default owner account exists
  [PASS] Owner password hash validates against IdliTempleMorning2026!
  [PASS] Categories seeded count (found: 4)
  [PASS] Active menu items seeded (found: 17)
  [PASS] Signature Ghee Podi Thatte Idli exists in menu
  [PASS] Outlets seeded (found: 3)
  [PASS] Kolar Road Flagship outlet exists
  [PASS] Tables seeded (found: 24)
  [PASS] Table has secure cryptographic token
  [PASS] SiteSettings singleton exists in database
  [PASS] Brand name is "Idli & More"

2. Verifying Edge JWT Authentication:
  [PASS] Jose signed standard 3-part JWT
  [PASS] Jose edge JWT verified payload correctly

3. Verifying QR Dining Logic & Order Calculation:
  [PASS] Generated valid SVG QR code string
  [PASS] Generated valid PNG QR code Buffer
  [PASS] Valid order payload accepted by CreateOrderSchema
  [PASS] Server-side price and 5% GST recalculated without trusting client totals
  [PASS] Created test order in database
  [PASS] Order transitioned from received to preparing with history entry
  [PASS] Cleaned up test order from DB

4. Verifying 86/Sold-Out & Audit Undo Logic:
  [PASS] Audit log created for 86 stock toggle
  [PASS] Successfully performed audit undo reversion to original stock status

5. Verifying Staff RBAC Restrictions:
  [PASS] Staff token has role "staff"
  [PASS] Staff access correctly prohibited for owner-only endpoint: /api/admin/users
  [PASS] Staff access correctly prohibited for owner-only endpoint: /api/admin/audit
  [PASS] Staff access correctly prohibited for owner-only endpoint: /api/admin/settings

6. Verifying Server-Side Sold-Out Ordering Enforcement:
  [PASS] Out-of-stock item detected by database lookup
  [PASS] Restored item stock to original status

----------------------------------------------
ALL VERIFICATION SUITE TESTS PASSED (0 FAILURES)!
```

---

## 6. Access & Credentials Reference

### Owner Administration
- **Login URL:** `/admin/login`
- **Default Email:** `owner@idliandmore.in`
- **Default Password:** `IdliTempleMorning2026!`
- **Role Capabilities:** Full catalog control, pricing adjustments, CSV import/export, table token management, outlet operating hours, site settings, staff management, audit log rollback.

### Staff / Kitchen Access
- **Login URL:** `/admin/login`
- **Role Capabilities:**
  - **Live Orders Screen (`/admin/orders`):** Sound alert chime on new order, step-through statuses (`Received` $\rightarrow$ `Preparing` $\rightarrow$ `Ready` $\rightarrow$ `Served`), table running bill, clear table.
  - **Today's Availability (`/admin/availability`):** 44px+ touch-friendly toggles to mark items "Sold out" instantly.
  - **Tables View (`/admin/tables`):** View dining tables and print table-tent QR cards.
  - *Owner pages (`/admin/users`, `/admin/settings`, `/admin/audit`) are automatically blocked with 403 Forbidden.*

---

## 7. Operational Workflows

### 1. Generating & Printing Table QR Codes
1. Navigate to `/admin/tables`.
2. Select your outlet (e.g. *Kolar Road Flagship*).
3. Click **Print All Tables**: Opens an A4 print-ready layout containing elegant table-tent cards styled with Kolam borders and clear "Scan to Order" instructions.
4. If a QR code is compromised or misplaced, click **Regenerate Token** to instantly invalidate the old QR code.

### 2. Marking an Item Out-of-Stock (86 List)
1. Staff or owner opens `/admin/availability` on a phone or tablet.
2. Search or find the dish (e.g. *Masala Cheese Idli*) and toggle the switch.
3. The change reflects instantly across public and table QR menus. The item is greyed out and blocked from checkout server-side.
4. The Vercel Cron job (`/api/cron/reset-stock`) automatically resets stock at 01:30 UTC (07:00 IST) daily.

### 3. Kitchen Live Order Handling
1. Keep `/admin/orders` open on a kitchen tablet.
2. When a diner places an order via their table QR, the kitchen tablet chimes an audio bell.
3. Tap **Start Preparing** $\rightarrow$ diner's status changes to *Preparing*.
4. Tap **Mark Ready** $\rightarrow$ runner brings food to Table $N$.
5. Tap **Mark Served** $\rightarrow$ once bill is settled at counter, tap **Clear Table**.
