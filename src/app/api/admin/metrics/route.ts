import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "PLATFORM_ADMIN") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // 1. Calcular MRR
    // Pega todas as assinaturas ativas e junta com o plano para somar os preços
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      include: { plan: true }
    });

    const mrr = activeSubscriptions.reduce((acc, sub) => acc + (sub.plan?.priceMonthly || 0), 0);

    // 2. Contadores de Lojas
    const totalStores = await prisma.store.count();
    const activeStores = await prisma.store.count({ where: { active: true } });
    const suspendedStores = totalStores - activeStores;

    // 3. Contadores de Usuários
    const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } });

    // 4. Últimos cadastros (opcional, para visualização rápida no dashboard)
    const recentStores = await prisma.store.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
        active: true,
        owner: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json({
      mrr,
      totalStores,
      activeStores,
      suspendedStores,
      totalCustomers,
      recentStores
    });

  } catch (error: any) {
    console.error("[ADMIN_METRICS_ERROR]", error);
    return new NextResponse(JSON.stringify({ error: "Erro interno no servidor" }), { status: 500 });
  }
}
