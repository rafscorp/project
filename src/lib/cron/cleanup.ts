import cron from "node-cron";
import prisma from "@/lib/db/prisma";

let isCronStarted = false;

export function startCronJobs() {
  if (isCronStarted || process.env.NEXT_RUNTIME === "edge") return;
  isCronStarted = true;

  console.log("🚀 [CRON] Inicializando Agendador de Tarefas em Background...");

  // 1. Limpeza de Cache da WDAPI (Roda a cada 1 hora)
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("🧹 [CRON] Iniciando limpeza de PlacaCache expirados...");
      const deleted = await prisma.placaCache.deleteMany({
        where: {
          expiresAt: { lt: new Date() }
        }
      });
      console.log(`[CRON] ${deleted.count} registros de cache apagados.`);
    } catch (e) {
      console.error("[CRON ERROR] Falha ao limpar cache:", e);
    }
  });

  // 2. Limpeza de Compras PIX Pendentes e Antigas (Roda todo dia às 03:00)
  cron.schedule("0 3 * * *", async () => {
    try {
      console.log("🧹 [CRON] Limpando tentativas de compra PIX abandonadas...");
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const deleted = await prisma.placaQueryPurchase.deleteMany({
        where: {
          paymentStatus: "PENDING",
          createdAt: { lt: threeDaysAgo }
        }
      });
      console.log(`[CRON] ${deleted.count} compras pendentes deletadas.`);
    } catch (e) {
      console.error("[CRON ERROR] Falha ao limpar compras abandonadas:", e);
    }
  });
}
