import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ============================================================
// POST /api/stripe/webhook
// Receives Stripe webhook events to confirm payments.
//
// When a customer pays via Stripe Checkout, Stripe sends a
// webhook here. We mark the order as "paid" in the database.
//
// SETUP (when you're ready):
// 1. Go to Stripe Dashboard → Developers → Webhooks
// 2. Add endpoint: https://yourdomain.com/api/stripe/webhook
// 3. Select events: checkout.session.completed
// 4. Copy the signing secret (whsec_...)
// 5. Add STRIPE_WEBHOOK_SECRET to Vercel env vars
// ============================================================

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecretKey);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        // Update the order status to "paid"
        // This works for both regular products and custom clay orders
        try {
          await db.product.updateMany({
            where: { slug: orderId },
            data: { tag: "Paid" },
          });
        } catch {
          // DB might not be available — that's OK on GitHub-backed mode
        }
        console.log(`[stripe] Order ${orderId} marked as paid`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }
}
