# Idli & More — South Indian Temple-Morning Experience (Bhopal)

> Vercel-native, single repository Next.js 14+ App Router restaurant storefront and full-stack management system with live table QR ordering, edge-safe JWT authentication, Mongoose connection caching, and Vercel Blob media uploads.

---

## 1. Architecture & Stack

- **Framework:** Next.js 14+ (App Router, TypeScript, React 18).
- **Styling & Motion:** Tailwind CSS with 60-30-10 temple brand tokens, Fraunces serif headings, Inter body, and pure SVG cultural motifs (Kolam, rising steam loops, banana leaf curve transitions).
- **API & Data Layer:** Route Handlers (`/app/api/**`), MongoDB Atlas with Mongoose using a global cached connection singleton (`lib/db.ts`) to eliminate connection exhaustion in serverless runtimes.
- **Authentication:** `jose` (JWT, edge-compatible) + `bcryptjs`. Session stored in an `httpOnly`, `Secure`, `SameSite=Lax` cookie (`admin_session`) with 12h expiry.
- **Route Protection:** Handled in `middleware.ts` using edge-safe `jose` with role gating:
  - `owner`: Full management access (Food catalog, pricing, categories, tables, outlets, offers, staff accounts, settings, audit rollback).
  - `staff`: Strictly limited to **Today's Availability (86 list)**, **Live Kitchen Orders**, and **Dining Tables**.
- **Images:** Vercel Blob client upload token (`POST /api/admin/upload-token`), compressed to WebP directly in the browser before upload to respect serverless payload limits.
- **Table QR System:** Server-side SVG & PNG QR code generation with unguessable tokens, live 5s customer order status polling, and A4 print-ready table-tent cards.
- **Data Validation:** Strict `zod` schemas on every API input.
- **Serverless Compliance:** No local disk writes, no long-running daemon processes, no Socket.IO.

---

## 2. Brand Identity & Design Tokens

- **60% Background Canvas:** `#FAF6EC` (Idli White / Rice Cream) & `#FFFDF7` (Coconut Surface)
- **30% Primary Accent:** `#2F5D3A` (Banana Leaf Green)
- **10% CTA Buttons:** `#E0A526` (Turmeric Gold)
- **Destructive / Sold Out Highlights:** `#B3261E` (Kumkum Red)
- **Borders & Dividers:** `#E8DCC4` (Sandalwood)
- **Dark Plinth & Footers:** `#1F3F28` (Deep Leaf)
- **Typography:** Fraunces (Display serif) + Inter (Clean sans) + Tiro Devanagari Hindi + Noto Sans Tamil.

---

## 3. Getting Started Locally

### Prerequisites
- Node.js 18+ (Tested on v24.20.0)
- MongoDB Atlas cluster URI (or local MongoDB)
- npm

### 1. Clone & Configure Environment Variables
```bash
cp .env.example .env.local
```
Fill in your credentials in `.env.local`:
```ini
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/idliandmore?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_min_32_characters_long_idli_bhopal_2026
ADMIN_EMAIL=owner@idliandmore.in
ADMIN_PASSWORD=IdliTempleMorning2026!
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Database
Seed initial owner credentials, real Bhopal menu dishes, outlets, tables with tokens, and site settings:
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the public storefront, and [http://localhost:3000/admin](http://localhost:3000/admin) for the management desk.

---

## 4. Vercel Deployment Step-by-Step

### 1. Prepare MongoDB Atlas Cluster
1. Create a MongoDB Atlas cluster in **Mumbai (`ap-south-1`)** for minimal latency to Vercel's `bom1` Mumbai region.
2. Create a Database User and note the username & password.
3. In **Network Access**, allow access from anywhere: `0.0.0.0/0` (Vercel serverless functions utilize dynamic IPs).

### 2. Import Repository into Vercel
1. Push this repository to GitHub.
2. In the Vercel Dashboard, click **Add New Project** and import the repository.
3. Framework Preset: **Next.js** (Root directory: `./`).

### 3. Configure Environment Variables in Vercel
Add the following in Vercel **Project Settings → Environment Variables** (Production & Preview):
- `MONGODB_URI`: Your MongoDB Atlas connection string.
- `JWT_SECRET`: A secure 32+ character random secret string.
- `ADMIN_EMAIL`: Initial owner email (e.g. `owner@idliandmore.in`).
- `ADMIN_PASSWORD`: Strong initial owner password.
- `CRON_SECRET`: Random secret string to secure daily stock reset cron invocations.
- `NEXT_PUBLIC_SITE_URL`: Your production domain (e.g. `https://idliandmore.in` or Vercel URL).

### 4. Enable Vercel Blob
1. In the Vercel dashboard, navigate to **Storage → Create Database → Blob**.
2. Connect the Blob store to your project. Vercel automatically populates `BLOB_READ_WRITE_TOKEN`.

### 5. Deploy & Seed Production
1. Click **Deploy**.
2. Once deployed, run the seed script locally against your production database:
   ```bash
   MONGODB_URI="your_production_mongodb_uri" npm run seed
   ```
3. Log in at `https://<your-domain>/admin/login` using your configured `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
4. Navigate to **Tables & QR Manager** (`/admin/tables`) and click **Print All Table Tents** to generate physical QR codes.

---

## 5. Vercel Limits & Architectural Decisions

- **No WebSockets in Serverless:** Live kitchen orders and customer table tracking rely on polling (every 5s for active orders, 15s for public menu stock updates) with lightweight JSON payloads and Web Audio synth notifications.
- **Serverless Request Body Limit (~4.5MB):** Dish images are compressed to WebP on the client canvas before uploading directly to Vercel Blob using client tokens (`/api/admin/upload-token`), avoiding server payload timeouts.
- **Vercel Cron Precision on Hobby Plan:** Vercel Hobby cron runs once daily with loose scheduling. The stock reset cron (`30 1 * * *` UTC / 07:00 IST) is configured in `vercel.json` and secured via `CRON_SECRET`.
