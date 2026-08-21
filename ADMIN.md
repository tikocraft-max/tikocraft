# Tikocraft — Admin Panel & Security Guide

## Admin Panel — Now Highly Secured

### Access
- **URL:** `/admin` (dashboard) or `/admin/login` (sign-in page)
- **Email:** `tikocraft.com@gmail.com`
- **Password:** (configured, not printed here for security)

### Security measures implemented

1. **Bcrypt password hashing** (12 rounds — computationally expensive to crack)
2. **HMAC-signed session tokens** — the session cookie is cryptographically signed with `SESSION_SECRET`. An attacker cannot forge a session even if they steal the cookie format.
3. **Rate limiting on login** — after 5 failed attempts from one IP, the IP is blocked for 15 minutes. Prevents brute-force attacks.
4. **HttpOnly + SameSite=strict cookies** — JavaScript can't read the session cookie, and it's never sent on cross-site requests (prevents CSRF).
5. **Constant-time password/token comparison** — prevents timing attacks.
6. **Security headers** (via middleware):
   - `X-Frame-Options: DENY` — admin can't be embedded in iframes (clickjacking protection)
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy` — disables camera/mic/geolocation
   - `Content-Security-Policy` — strict CSP blocking inline scripts
   - `Strict-Transport-Security` (HSTS) in production
7. **Generic error messages** — "Invalid credentials" never reveals whether email or password was wrong.
8. **`/admin` and `/api` blocked in robots.txt** — search engines won't index the admin panel.
9. **No prefill on login form** — email field is empty; you must type it each time.

### ⚠️ IMPORTANT — Change the session secret

The current `SESSION_SECRET` is a placeholder. For production, generate a strong random secret:

```bash
openssl rand -hex 32
```

Then set it as an environment variable on Vercel:
- Go to https://vercel.com → your project → Settings → Environment Variables
- Add `SESSION_SECRET` with the generated value
- Redeploy

---

## Database — Why products don't persist on Vercel

The site uses **SQLite** (a file-based database). This works perfectly in local development, but on Vercel's serverless platform, the filesystem is **ephemeral**:

1. Every cold start of a serverless function gets a fresh `/tmp` directory.
2. Any product you add via the admin panel **will be lost** when the function cold-starts (typically within minutes of inactivity).
3. The database is re-seeded on every build from `scripts/seed.ts`, so only the seed data persists.

### How to make products persist (production fix)

Switch to a real Postgres database. **Neon** (https://neon.tech) offers a free tier and takes 30 seconds to set up:

#### Step 1: Create a Neon database
1. Go to https://neon.tech → Sign up (free, no credit card)
2. Create a new project named "tikocraft"
3. Copy the **connection string** (looks like `postgresql://user:pass@ep-xxx.region.aws.neon.tech/tikocraft?sslmode=require`)

#### Step 2: Add it to Vercel
1. Go to https://vercel.com → your project (`my-project`) → Settings → Environment Variables
2. Add `DATABASE_URL` with the Neon connection string (for all environments: Production, Preview, Development)
3. (Optional) Add `SESSION_SECRET` with a random 32-char string

#### Step 3: Switch Prisma to Postgres
Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"   // change from "sqlite"
  url      = env("DATABASE_URL")
}
```
Then commit and push — Vercel will auto-redeploy.

#### Step 4: Push the schema + seed
After the deploy, run locally:
```bash
DATABASE_URL="your-neon-connection-string" bun run db:push
DATABASE_URL="your-neon-connection-string" bun run seed
```
This creates the tables in Postgres and seeds them with the initial 5 categories + 10 products + admin user.

### After switching to Postgres
- ✅ Products added via admin panel **persist forever**
- ✅ Products deleted stay deleted
- ✅ Changes are visible instantly on the storefront
- ✅ The database is backed up automatically by Neon

---

## Stripe Payments — Yes, fully supported

See the original Stripe guide below (unchanged). Stripe works regardless of which database you use.

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
- Verify your business
- Switch to "Live mode" when ready

#### 2. Get your API keys
In Stripe dashboard → Developers → API keys:
- **Publishable key:** `pk_test_...` (safe for browser)
- **Secret key:** `sk_test_...` (server-only)

#### 3. Install the Stripe SDK
```bash
bun add stripe
```

#### 4. Add environment variables (on Vercel)
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

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customer.email,
      line_items: items.map((item: any) => ({
        quantity: item.quantity,
        price_data: {
          currency: customer.currency.toLowerCase(),
          unit_amount: Math.round(item.priceUSD * 100),
          product_data: { name: item.name },
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

#### 6. Handle Stripe webhooks
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
      body, sig, process.env.STRIPE_WEBHOOK_SECRET!
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
  window.location.href = url;
}}>
  Buy Now
</button>
```

### Important Stripe notes

1. **Webhooks in production:** Register your webhook URL (`https://yourdomain.com/api/stripe-webhook`) in Stripe dashboard → Developers → Webhooks.
2. **Test cards:** Use `4242 4242 4242 4242` for testing.
3. **No PCI compliance needed:** Stripe Checkout hosts the payment form — card data never touches your server.
4. **Fees:** ~2.9% + 30¢ per transaction (varies by country).
5. **Entity note:** Tikocraft is operated by Wenov8 LLC, a Wyoming (USA) company. Stripe is fully supported in the United States — register the Stripe account under Wenov8 LLC with a US bank account.

---

## Need help?

If you want me to:
- **Switch to Postgres** end-to-end (just say "switch to Postgres" — I'll guide you)
- **Add Stripe checkout** fully implemented (just say "add Stripe")
- **Change the admin password** again (edit `scripts/seed.ts` and re-run)
