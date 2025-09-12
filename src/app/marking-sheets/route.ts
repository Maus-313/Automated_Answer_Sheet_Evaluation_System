import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slot = searchParams.get("slot")?.trim();
    // Handle pre-migration client gracefully
    const anyPrisma = prisma as any;
    if (!anyPrisma?.markingSheet?.findMany) {
      // Prisma Client not regenerated yet; return empty so UI shows "No Record Found"
      return NextResponse.json({ items: [] });
    }
    const rows = await anyPrisma.markingSheet.findMany({
      where: slot ? { slot } : undefined,
    });
    return NextResponse.json({ items: rows });
  } catch (err: any) {
    console.error("GET /marking-sheets error", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to load MarkingSheet" },
      { status: 500 }
    );
  }
}
