import prisma from "@/lib/db/prisma";

export type SubscriptionValidation = {
  isValid: boolean;
  storeId: string | null;
  status: string | null;
  reason: "NO_STORE" | "NO_SUBSCRIPTION" | "PAST_DUE" | "CANCELED" | "EXPIRED" | "VALID";
};

/**
 * Valida a assinatura de um lojista.
 * A ÚNICA Fonte de Verdade é o Banco de Dados.
 * Qualquer tentativa de burla no frontend será bloqueada aqui.
 */
export async function validateStoreSubscription(userId: string): Promise<SubscriptionValidation> {
  const store = await prisma.store.findFirst({
    where: { ownerId: userId },
    include: { subscription: true }
  });

  if (!store) {
    return { isValid: false, storeId: null, status: null, reason: "NO_STORE" };
  }

  if (!store.subscription) {
    return { isValid: false, storeId: store.id, status: null, reason: "NO_SUBSCRIPTION" };
  }

  const { status } = store.subscription;

  // Assinaturas ativas ou em período de testes são permitidas
  if (status === "ACTIVE" || status === "TRIAL") {
    return { isValid: true, storeId: store.id, status, reason: "VALID" };
  }

  // Qualquer outro status (PAST_DUE, CANCELLED, EXPIRED) é bloqueado
  return { 
    isValid: false, 
    storeId: store.id, 
    status, 
    reason: status === "PAST_DUE" ? "PAST_DUE" : 
            status === "CANCELLED" ? "CANCELED" : "EXPIRED" 
  };
}

/**
 * Verifica se a loja atingiu o limite de produtos do seu plano.
 */
export async function canCreateProduct(storeId: string): Promise<boolean> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      subscription: {
        include: { plan: true }
      }
    }
  });

  if (!store || !store.subscription) return false;

  const status = store.subscription.status;
  if (status !== "ACTIVE" && status !== "TRIAL") return false;

  // Conta produtos ativos no banco
  const activeProductCount = await prisma.product.count({
    where: { storeId, deletedAt: null }
  });

  const maxProducts = store.subscription.plan.maxProducts;

  return activeProductCount < maxProducts;
}

// Exporta como namespace/objeto para compatibilidade com o formato de classe
export const SubscriptionGuard = {
  validateStoreSubscription,
  canCreateProduct,
};
