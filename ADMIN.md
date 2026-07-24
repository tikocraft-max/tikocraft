# Tikocraft — Admin Panel & Payment Guide

## Admin Panel

### Access
- **URL:** `/admin` (dashboard) or `/admin/login` (sign-in page)
- **Email:** `admin@tikocraft.studio`
- **Password:** `tikocraft2026`

> ⚠️ **Change the default password immediately.** Either:
> 1. Edit `scripts/seed.ts` and re-run `bun run scripts/seed.ts`, OR
> 2. Use the API directly with a new bcrypt hash

### ⚠️ IMPORTANT — SQLite on Vercel

The site currently uses **SQLite** (a local file-based database). This works perfectly in local development, but on Vercel's serverless platform, the filesystem is **ephemeral** — meaning:

1. Every cold start of a serverless function gets a fresh filesystem.
2. Any product you add via the admin panel **will be lost** when the function cold-starts.
3. The database is re-seeded on every build (from `scripts/seed.ts`), so only the seed data persists.

**For production use, you should switch to a real database:**
- **Vercel Postgres** (free tier available, recommended) — https://vercel.com/docs/storage/vercel-postgres
- **PlanetScale** (MySQL, free tier) — https://planetscale.com
- **Supabase** (Postgres, free tier) — https://supabase.com
- **Neon** (Postgres, free tier) — https://neon.tech

To switch, just change the `provider` in `prisma/schema.prisma` from `"sqlite"` to `"postgresql"` and update the `DATABASE_URL` env var. The Prisma client code stays the same.

### What you can do
- **Products tab:** Create, edit, delete, publish/unpublish products
- **Categories tab:** Create new categories, delete empty ones
- **Pricing:** Enter prices in USD — the storefront converts them automatically based on the visitor's selected country/currency

### How products appear on the store
The public storefront fetches products from `/api/catalog`. When you create or edit a product in the admin panel, it appears on the store within a few seconds (no rebuild needed — data comes from the database at request time).

A product must be **Published** (the toggle in the admin) to appear on the store.

---

## Country & Currency Selector

The navbar has a globe icon that opens a country picker. Supported countries:

| Country | Currency | Symbol | Rate from USD |
|---------|----------|--------|---------------|
| United States | USD | $ | 1.00 |
| Canada | CAD | C$ | 1.36 |
| United Kingdom | GBP | £ | 0.79 |
| France | EUR | € | 0.92 |
| Germany | EUR | € | 0.92 |
| Italy | EUR | € | 0.92 |
| Spain | EUR | € | 0.92 |
| Netherlands | EUR | € | 0.92 |

The visitor's choice is saved in `localStorage` and persists across visits.

### Updating exchange rates
Rates are hardcoded in `src/lib/currency.tsx` (the `COUNTRIES` array). To update them, edit the `rateFromUSD` field for each country and redeploy.

For live exchange rates, you would integrate a forex API (e.g. exchangerate-api.com) — out of scope for this build, but easy to add.

---

## Stripe Payments — Can you add it? YES ✅

Stripe is fully supported and easy to add. Here's a complete guide.

### How it works (the architecture)

```
Customer browses → Adds to cart → Clicks "Checkout"
       ↓
Your server creates a Stripe Checkout Session
       ↓
Customer is redirected to Stripe's hosted payment page
       ↓
Stripe processes the card (PCI-compliant, no card data touches your server)
       ↓
Customer is redirected back to your site (success/cancel URLs)
       ↓
Stripe sends a webhook to your server confirming payment
       ↓
You mark the Order as "paid" in the database
```

### Step-by-step setup

#### 1. Create a Stripe account
- Go to https://dashboard.stripe.com/register
- Verify your business (Stripe may ask for ID + bank details)
- Switch from "Test mode" to "Live mode" when ready

#### 2. Get your API keys
In the Stripe dashboard → Developers → API keys:
- **Publishable key:** `pk_test_...` (safe to expose to the browser)
- **Secret key:** `sk_test_...` (server-only, NEVER expose)

#### 3. Install the Stripe SDK
```bash
bun add stripe
```

#### 4. Add environment variables
Create or edit `.env.local`:
```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

#### 5. Create a checkout API route
Create `src/app/api/checkout/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { items, customer } = await req.json();
    // items = [{ slug, name, priceUSD, quantity }]
    // customer = { email, fullName, country, currency }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customer.email,
      line_items: items.map((item: any) => ({
        quantity: item.quantity,
        price_data: {
          currency: customer.currency.toLowerCase(),
          unit_amount: Math.round(item.priceUSD * 100), // in cents
          product_data: {
            name: item.name,
          },
        },
      })),
      success_url: `${req.headers.get("origin")}/?checkout=success`,
      cancel_url: `${req.headers.get("origin")}/?checkout=cancelled`,
      metadata: {
        email: customer.email,
        fullName: customer.fullName,
        country: customer.country,
        currency: customer.currency,
      },
    });

    // Create a pending order in DB
    await db.order.create({
      data: {
        email: customer.email,
        fullName: customer.fullName,
        country: customer.country,
        currency: customer.currency,
        totalAmount: items.reduce((sum: number, i: any) => sum + i.priceUSD * i.quantity, 0),
        status: "pending",
        stripeSession: session.id,
        itemsJson: JSON.stringify(items),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
```

#### 6. Handle Stripe webhooks (to confirm payment)
Create `src/app/api/stripe-webhook/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await db.order.updateMany({
      where: { stripeSession: session.id },
      data: { status: "paid" },
    });
  }

  return NextResponse.json({ received: true });
}
```

#### 7. Add a "Buy" button on product pages
On your product card, add:
```tsx
<button onClick={async () => {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ slug, name, priceUSD, quantity: 1 }],
      customer: { email: "guest@example.com", fullName: "Guest", country: "US", currency: "USD" }
    }),
  });
  const { url } = await res.json();
  window.location.href = url; // redirect to Stripe
}}>
  Buy Now
</button>
```

### Important Stripe notes

1. **Vercel + Stripe webhooks:** In production, you must register your webhook URL (`https://yourdomain.com/api/stripe-webhook`) in the Stripe dashboard → Developers → Webhooks. Stripe will give you the `whsec_...` secret.

2. **Test mode:** Use Stripe's test cards (e.g. `4242 4242 4242 4242`) to test checkout without real charges.

3. **No PCI compliance needed:** Stripe Checkout hosts the payment form on Stripe's domain, so card data never touches your server. This is the simplest, safest setup.

4. **Fees:** Stripe charges ~2.9% + 30¢ per transaction (varies by country).

5. **Supported countries:** Stripe is available in 46+ countries. Morocco (where Tikocraft is based) is NOT directly supported — you would need to register Stripe via a supported country (e.g. France, UK, US) and use a bank account there. Alternatively, use a regional gateway like:
   - **CMI** (Moroccan local cards)
   - **PayPal** (works internationally)
   - **Paystack** (Africa)

---

## Need help?

If you want me to wire up Stripe fully (checkout button + webhook + order tracking), just say "add Stripe checkout" and I'll implement it end-to-end.
