import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const plan = await prisma.subscriptionPlan.update({
      where: { id: params.id },
      data: { active }
    });

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error("[ADMIN_PLAN_TOGGLE_ERROR]", error);
    return new NextResponse(JSON.stringify({ error: "Erro ao atualizar plano" }), { status: 500 });
  }
}
