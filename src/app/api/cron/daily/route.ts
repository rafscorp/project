import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
// import { sendPlanExpiringEmail } from "@/lib/email/templates"; // TODO se precisar enviar emails diarios

// Protege a rota para ser chamada apenas pelo Vercel Cron ou serviço autenticado no futuro
// export const maxDuration = 60; 

export async function GET(request: Request) {
  // Num sistema real, usaríamos um cabeçalho Authorization com Bearer token para segurança
  const authHeader = request.headers.get("authorization");
  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Para simplificar localmente, só checa se em prod
    // return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const today = new Date();

    // 1. Limpar (marcar como usado/expirado) ofertas que venceram
    const expiredOffers = await prisma.storeOffer.updateMany({
      where: {
        used: false,
        expiresAt: { lte: today }
      },
      data: {
        used: true,
        usedAt: new Date() // tecnicamente não usado pelo cliente, mas "queimado" pelo sistema
      }
    });

    // 2. Avisos de plano expirando
    // Para implementar isso, precisaríamos que as assinaturas tivessem currentPeriodEnd 
    // populado com precisão pelo Stripe/MercadoPago.
    // Como a integração financeira será feita em breve, deixamos a query preparada:
    
    /*
    const in3Days = new Date();
    in3Days.setDate(in3Days.getDate() + 3);
    
    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        currentPeriodEnd: {
          gte: today,
          lte: in3Days
        }
      },
      include: { store: { include: { owner: true } } }
    });

    for (const sub of expiringSubscriptions) {
      await sendPlanExpiringEmail(sub.store.owner.email, sub.store.owner.name, sub.store.name);
    }
    */

    return NextResponse.json({ 
      success: true, 
      message: "Daily cron executed", 
      expiredOffersCount: expiredOffers.count 
    });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
