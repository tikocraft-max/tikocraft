import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const debug: any = {
    timestamp: new Date().toISOString(),
    env: {
      VERCEL: process.env.VERCEL,
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_set: !!process.env.DATABASE_URL,
      DATABASE_URL_value: process.env.DATABASE_URL,
    },
    steps: [] as string[],
    errors: [] as string[],
  };

  try {
    debug.steps.push("Trying db.category.count()");
    const count = await db.category.count();
    debug.steps.push(`count returned: ${count}`);
    debug.categoryCount = count;
  } catch (err: any) {
    debug.errors.push(`count failed: ${err.message}`);
    debug.errors.push(`stack: ${err.stack?.split("\n").slice(0, 5).join(" | ")}`);
  }

  try {
    debug.steps.push("Trying db.product.count()");
    const pcount = await db.product.count();
    debug.steps.push(`product count: ${pcount}`);
    debug.productCount = pcount;
  } catch (err: any) {
    debug.errors.push(`product count failed: ${err.message}`);
  }

  return NextResponse.json(debug);
}
