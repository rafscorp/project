import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "PLATFORM_ADMIN") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const stores = await prisma.store.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { name: true, email: true } },
        subscription: { include: { plan: true } }
      }
    });

    return NextResponse.json(stores);
  } catch (error: any) {
    console.error("[ADMIN_STORES_ERROR]", error);
    return new NextResponse(JSON.stringify({ error: "Erro ao buscar lojas" }), { status: 500 });
  }
}
