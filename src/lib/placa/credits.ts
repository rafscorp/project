import prisma from "@/lib/db/prisma";

export const PLACA_FREE_LIMIT = 10;

export async function checkPlacaCredits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { placaFreeUsed: true, placaCredits: true },
  });

  if (!user) {
    return { allowed: false, reason: "not_logged" };
  }

  // 1. Tenta usar cota gratuita primeiro
  if (user.placaFreeUsed < PLACA_FREE_LIMIT) {
    return {
      allowed: true,
      isFreeQuota: true,
      remaining: PLACA_FREE_LIMIT - user.placaFreeUsed,
      freeUsed: user.placaFreeUsed,
      reason: "ok"
    };
  }

  // 2. Tenta usar créditos pagos
  if (user.placaCredits > 0) {
    return {
      allowed: true,
      isFreeQuota: false,
      remaining: user.placaCredits,
      freeUsed: user.placaFreeUsed,
      reason: "ok"
    };
  }

  // 3. Sem créditos
  return {
    allowed: false,
    reason: "no_credits"
  };
}

export async function debitPlacaCredit(userId: string, isFreeQuota: boolean) {
  if (isFreeQuota) {
    await prisma.user.update({
      where: { id: userId },
      data: { placaFreeUsed: { increment: 1 } },
    });
  } else {
    // Garante que não fique negativo
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.placaCredits > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { placaCredits: { decrement: 1 } },
      });
    }
  }

  // Registra no log de auditoria
  await prisma.auditLog.create({
    data: {
      userId,
      action: "PLACA_QUERY",
    }
  });
}
