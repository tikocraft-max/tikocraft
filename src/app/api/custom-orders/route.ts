import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/security";
import {
  getAllProducts,
  saveProduct,
  type StoredProduct,
} from "@/lib/github-db";
import { ensureGitHubSeeded } from "@/lib/github-db";

// ============================================================
// Custom Clay Figures Orders API
//
// GET  /api/custom-orders  — list all custom orders (admin only)
// POST /api/custom-orders  — create a new custom order (public)
//
// Orders are stored as products with a special category slug
// "custom-clay" and metadata in the description/material fields.
// The reference photo is uploaded as a separate file in the repo
// and referenced by URL in the images array.
// ============================================================

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_OWNER = "tikocraft-max";
const REPO_NAME = "tikocraft";
const BRANCH = "main";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tikocraft-admin-session");
  if (!token?.value) return null;
  const { email, valid } = verifySessionToken(token.value);
  if (!valid || !email) return null;
  return { email, name: "Admin", role: "owner" };
}

// GET — admin lists all custom orders
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureGitHubSeeded();
    const allProducts = await getAllProducts();
    const customOrders = allProducts.filter(
      (p) => p.categorySlug === "custom-clay-orders"
    );
    return NextResponse.json({ orders: customOrders });
  } catch (err) {
    console.error("GET /api/custom-orders error:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST — public creates a new custom order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      customerName,
      customerEmail,
      size,
      priceUSD,
      referencePhoto, // base64 data URL or GitHub raw URL
      notes,
      occasion, // "gift" | "personal" | "memorial" | "other"
      recipientName,
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !size || !priceUSD) {
      return NextResponse.json(
        { error: "Missing required fields (name, email, size, price)" },
        { status: 400 }
      );
    }

    if (!referencePhoto) {
      return NextResponse.json(
        { error: "Reference photo is required" },
        { status: 400 }
      );
    }

    // If the photo is a base64 data URL, upload it to GitHub
    let photoUrl = referencePhoto;
    if (referencePhoto.startsWith("data:") && GITHUB_TOKEN) {
      const base64Content = referencePhoto.split(",")[1];
      const ext = referencePhoto.match(/data:image\/(\w+)/)?.[1] || "png";
      const filename = `custom_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;
      const path = `data/custom-orders/${filename}`;

      const githubRes = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `custom order photo: ${filename}`,
            content: base64Content,
            branch: BRANCH,
          }),
        }
      );

      if (githubRes.ok) {
        photoUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${path}`;
      }
    }

    // Create the order as a "product" with special metadata
    const orderId = `custom_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const now = new Date().toISOString();

    // Store all order info in the description and material fields
    const orderDescription = [
      `Custom Clay Figure Order`,
      ``,
      `Customer: ${customerName}`,
      `Email: ${customerEmail}`,
      `Size: ${size}`,
      `Price: $${priceUSD}`,
      `Occasion: ${occasion || "personal"}`,
      occasion === "gift" && recipientName ? `Recipient: ${recipientName}` : "",
      notes ? `Notes: ${notes}` : "",
      ``,
      `Order Date: ${now}`,
      `Order ID: ${orderId}`,
      `Status: pending`,
    ]
      .filter(Boolean)
      .join("\n");

    const order: StoredProduct = {
      id: orderId,
      name: `Custom Clay Figure — ${customerName}`,
      slug: orderId,
      categorySlug: "custom-clay-orders",
      description: orderDescription,
      priceUSD: Number(priceUSD),
      tag: "Custom Order",
      isPublished: false, // not visible on storefront
      sortOrder: 0,
      image: photoUrl,
      images: [photoUrl],
      videoUrl: null,
      material: JSON.stringify({
        customerName,
        customerEmail,
        size,
        occasion: occasion || "personal",
        recipientName: recipientName || "",
        notes: notes || "",
        status: "pending",
        orderDate: now,
        orderId,
      }),
      dimensions: size,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await saveProduct(order);

    if (!saved) {
      return NextResponse.json(
        { error: "Failed to save order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      orderId,
      message: "Your custom clay figure order has been received!",
    });
  } catch (err) {
    console.error("POST /api/custom-orders error:", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

// PATCH — admin updates order status
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, status } = await req.json();
    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status required" },
        { status: 400 }
      );
    }

    const allProducts = await getAllProducts();
    const order = allProducts.find((p) => p.slug === orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update the material field (JSON with status)
    let materialData: any = {};
    try {
      materialData = JSON.parse(order.material || "{}");
    } catch {
      // ignore
    }
    materialData.status = status;

    const updated: StoredProduct = {
      ...order,
      material: JSON.stringify(materialData),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveProduct(updated);
    if (!saved) {
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, order: updated });
  } catch (err) {
    console.error("PATCH /api/custom-orders error:", err);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
