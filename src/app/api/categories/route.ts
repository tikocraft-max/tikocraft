import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { z } from "zod";
import { ensureSeeded } from "../catalog/route";

// GET /api/categories — list all categories (public)
export async function GET() {
  try {
    await ensureSeeded();
    const categories = await db.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: { where: { isPublished: true } } } },
      },
    });
    return NextResponse.json({ categories });
  } catch (err) {
    console.error("GET /api/categories error", err);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("tikocraft-admin-session");
  const email = cookieStore.get("tikocraft-admin-email");
  if (!session?.value || !email?.value) return null;
  try {
    return await db.adminUser.findUnique({
      where: { email: email.value },
      select: { email: true, name: true, role: true },
    });
  } catch {
    return null;
  }
}

const createSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  categoryType: z.enum(["decor", "booknook"]).optional(),
  sortOrder: z.number().optional(),
});

// POST /api/categories — create category (admin only)
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized — admin login required" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid category data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const category = await db.category.create({
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
        subtitle: parsed.data.subtitle ?? null,
        description: parsed.data.description ?? null,
        image: parsed.data.image ?? null,
        categoryType: parsed.data.categoryType ?? "decor",
        sortOrder: parsed.data.sortOrder ?? 0,
      },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    console.error("POST /api/categories error", err);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
