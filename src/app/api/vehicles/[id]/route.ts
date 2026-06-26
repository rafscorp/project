import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

// DELETE /api/vehicles/[id] — Remove veículo da garagem do usuário
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await context.params;

    // Zero Trust: garante que o veículo pertence ao usuário autenticado
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, userId: session.userId },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Veículo não encontrado" }, { status: 404 });
    }

    await prisma.vehicle.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API DELETE /vehicles/:id]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
