import cron from "node-cron";
import prisma from "@/lib/db/prisma";
import { emailProvider } from "@/lib/email/provider";
import { createPixPayment } from "@/lib/payments/mercadopago";

/**
 * Inicia o Robô de E-mails da plataforma.
 * Esta função deve ser chamada na inicialização do servidor (ex: instrumentation.ts)
 */
export function startEmailBot() {
  console.log("🤖 [EMAIL BOT] Inicializando Cron Jobs...");

  // Roda todos os dias às 08:00 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("🤖 [EMAIL BOT] Iniciando varredura diária de assinaturas...");
    
    try {
      // 1. Procurar lojas cujo plano vai vencer em exatos 3 dias
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const startOfDay = new Date(threeDaysFromNow);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(threeDaysFromNow);
      endOfDay.setHours(23, 59, 59, 999);

      const expiringSoon = await prisma.subscription.findMany({
        where: {
          status: "ACTIVE",
          currentPeriodEnd: {
            gte: startOfDay,
            lte: endOfDay,
          }
        },
        include: {
          store: { include: { owner: true } },
          plan: true,
        }
      });

      console.log(`🤖 [EMAIL BOT] Encontradas ${expiringSoon.length} assinaturas vencendo em 3 dias.`);

      for (const sub of expiringSoon) {
        if (!sub.store.owner.email) continue;
        
        // Gera a cobrança automática via PIX
        const pixRes = await createPixPayment({
          transactionAmount: Number(sub.plan.price),
          description: `Renovação - Plano ${sub.plan.name} - ConectaParts`,
          payerEmail: sub.store.owner.email,
          payerName: sub.store.owner.name,
          externalReference: sub.store.id,
        });

        const pixLinkHtml = pixRes.success && pixRes.data?.ticketUrl 
          ? `<a href="${pixRes.data.ticketUrl}" style="background: #f5b942; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Pagar via PIX agora</a>`
          : `<p>Acesse seu painel na ConectaParts para gerar a fatura.</p>`;

        const emailHtml = `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Olá, ${sub.store.name}!</h2>
            <p>Seu plano <strong>${sub.plan.name}</strong> na ConectaParts vence em 3 dias.</p>
            <p>Para não perder o acesso ao seu balcão digital e continuar recebendo mensagens dos clientes, renove agora mesmo.</p>
            <br/>
            ${pixLinkHtml}
            <br/><br/>
            <p>Atenciosamente,<br/>Equipe ConectaParts</p>
          </div>
        `;

        await emailProvider.send({
          to: sub.store.owner.email,
          subject: "Faltam 3 dias! Renove seu plano ConectaParts",
          html: emailHtml,
        });
      }

      // 2. Bloquear lojas cujo plano VENCEU ONTEM
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const expired = await prisma.subscription.findMany({
        where: {
          status: "ACTIVE",
          currentPeriodEnd: {
            lt: yesterday,
          }
        },
        include: {
          store: { include: { owner: true } },
          plan: true,
        }
      });

      console.log(`🤖 [EMAIL BOT] Encontradas ${expired.length} assinaturas vencidas para bloquear.`);

      for (const sub of expired) {
        // Suspender no banco
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: "PAST_DUE" }
        });

        // Enviar aviso de suspensão
        if (sub.store.owner.email) {
          const emailHtml = `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Atenção, ${sub.store.name}!</h2>
              <p>O seu plano <strong>${sub.plan.name}</strong> venceu e sua loja foi suspensa da Vitrine Inteligente.</p>
              <p>Acesse seu painel agora mesmo para regularizar e voltar a vender.</p>
            </div>
          `;
          await emailProvider.send({
            to: sub.store.owner.email,
            subject: "Loja Suspensa - Plano Vencido | ConectaParts",
            html: emailHtml,
          });
        }
      }
      
    } catch (error) {
      console.error("🤖❌ [EMAIL BOT ERROR]:", error);
    }
  });
}
