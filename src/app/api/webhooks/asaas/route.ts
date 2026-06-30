import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { SubscriptionStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const ASAAS_WEBHOOK_SECRET = process.env.ASAAS_WEBHOOK_SECRET;
    
    // O Asaas envia o token configurado no header 'asaas-access-token'
    const authHeader = req.headers.get("asaas-access-token");
    if (ASAAS_WEBHOOK_SECRET && authHeader !== ASAAS_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    console.log("[Asaas Webhook] Evento recebido:", payload.event);

    // Tratamento de pagamentos concluídos
    if (payload.event === "PAYMENT_RECEIVED" || payload.event === "PAYMENT_CONFIRMED") {
      const asaasSubscriptionId = payload.payment?.subscription;

      if (asaasSubscriptionId) {
        // Encontra a assinatura da loja correspondente a este ID do Asaas
        const subscription = await prisma.subscription.findFirst({
          where: { asaasSubscriptionId },
        });

        if (subscription) {
          // Ativa o plano e projeta o vencimento baseado na cobrança do Asaas
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: SubscriptionStatus.ACTIVE,
              currentPeriodEnd: payload.payment.dueDate ? new Date(payload.payment.dueDate) : undefined,
            },
          });
          
          console.log(`[Asaas Webhook] Assinatura da loja ${subscription.storeId} ativada com sucesso.`);
        } else {
          console.log(`[Asaas Webhook] Assinatura Asaas ${asaasSubscriptionId} não encontrada no banco local.`);
        }
      }
    } 
    // Tratamento de inadimplência e cancelamento
    else if (payload.event === "PAYMENT_OVERDUE" || payload.event === "PAYMENT_DELETED") {
       const asaasSubscriptionId = payload.payment?.subscription;
       if (asaasSubscriptionId) {
         await prisma.subscription.updateMany({
           where: { asaasSubscriptionId },
           data: { status: SubscriptionStatus.PAST_DUE }
         });
         console.log(`[Asaas Webhook] Assinatura Asaas ${asaasSubscriptionId} suspensa por falta de pagamento.`);
       }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[Asaas Webhook Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
