import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "PLATFORM_ADMIN") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { active } = await request.json();

    if (typeof active !== "boolean") {
      return new NextResponse(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }

    const resolvedParams = await params;
    const store = await prisma.store.update({
      where: { id: resolvedParams.id },
      data: { active }
    });

    return NextResponse.json(store);
  } catch (error: any) {
    console.error("[ADMIN_STORE_TOGGLE_ERROR]", error);
    return new NextResponse(JSON.stringify({ error: "Erro ao atualizar loja" }), { status: 500 });
  }
}
