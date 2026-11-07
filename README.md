# Crestone E-Bikes (`crestoneebikes.com`)

Local community marketplace for buying and selling electric bikes, spare batteries, fat tires, and gear in **Crestone & the Baca Grande, Colorado**, paired with local mechanic **Wade’s E-Bike Workshop**.

## What's Included

- **Community E-Bike & Gear Marketplace**: Filter by E-Bikes, Batteries & Chargers, Parts & Fat Tires, or Trailers & Gear; search by brand or neighborhood; filter for **Wade-Inspected** bikes; and post new listings for free.
- **Direct Neighbor Contact**: Click any listing to view full technical specs (motor wattage, battery capacity, range, wheel size), read Wade's inspection notes, and reveal/copy the seller's preferred phone/text or email.
- **Meet Wade & Inside the Workshop**:
  - Two custom placeholder photos of Wade in front of his Crestone shop (`/images/wade-shop-front.jpg`) and inside his repair workshop (`/images/wade-workshop.jpg`).
  - Wade's quote: *"I just want to get people riding bikes!"*
  - Overview of how Wade diagnoses and fixes e-bikes (load-testing batteries, motor & controller wiring, heavy-duty brakes, and Crestone sand/goathead proofing).
  - Back-burner **Coming Soon: Short Video Interview with Wade** placeholder card.
- **"Buy Wade a Coffee" Community Tip Jar**: Keeps posting 100% free for the community with optional contribution tiers.
- **Supabase + Magic Link Auth + Vercel Ready**:
  - Runs out-of-the-box in **Interactive Prototype Mode** (using `localStorage` seeded with Crestone listings and instant simulated magic-link login).
  - Automatically switches to live **Supabase Postgres + Passwordless Email OTP** when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set.

## Quick Start

```bash
npm install
npm run dev
```

## Connecting Supabase & Deploying to Vercel

1. Create a new Supabase project and run the SQL in [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor.
2. Copy `.env.example` to `.env.local` and fill in your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
3. Push to GitHub and import into **Vercel** (`vercel.json` is pre-configured for SPA routing).

