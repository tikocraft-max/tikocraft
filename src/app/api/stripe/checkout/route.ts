import { NextRequest, NextResponse } from "next/server";

// ============================================================
// POST /api/stripe/checkout
// Creates a Stripe Checkout Session for automatic payment.
//
// This endpoint is READY for when you add your Stripe API key.
// Just set STRIPE_SECRET_KEY in Vercel env vars and install the
// stripe package: bun add stripe
//
// The flow will be:
// 1. Customer fills the form (custom clay or cart checkout)
// 2. Frontend calls this endpoint with order details
// 3. This creates a Stripe Checkout Session
// 4. Customer is redirected to Stripe's hosted payment page
// 5. After payment, Stripe redirects back to the success URL
// 6. Stripe sends a webhook to confirm payment (mark order as paid)
//
// For now, if STRIPE_SECRET_KEY is not set, returns an error
// instructing the admin to configure Stripe.
// ============================================================

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured yet. Add STRIPE_SECRET_KEY to Vercel env vars and install the stripe package.",
        notConfigured: true,
      },
      { status: 503 }
    );
  }

  try {
    // Dynamically import stripe (only loads when key is present)
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecretKey);

    const body = await req.json();
    const {
      items,
      customerEmail,
      customerName,
      orderId,
      successUrl,
      cancelUrl,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No items in order" },
        { status: 400 }
      );
    }

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      quantity: item.quantity || 1,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(item.priceUSD * 100), // cents
        product_data: {
          name: item.name,
          description: item.description || undefined,
          images: item.image ? [item.image] : undefined,
        },
      },
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items: lineItems,
      success_url:
        successUrl ||
        `${req.headers.get("origin")}/#custom-clay?status=success`,
      cancel_url:
        cancelUrl || `${req.headers.get("origin")}/#custom-clay?status=cancelled`,
      metadata: {
        orderId: orderId || "",
        customerName: customerName || "",
      },
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "FR", "DE", "IT", "ES", "NL", "MA"],
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
