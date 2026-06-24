import prisma from "@/lib/db/prisma";

/** Planos e assinaturas — empresas pagam mensalidade à Agury */
export class SubscriptionService {
  static async listPlans() {
    return prisma.subscriptionPlan.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async getStoreSubscription(storeId: string) {
    return prisma.subscription.findUnique({
      where: { storeId },
      include: { plan: true },
    });
  }

  static async getPlatformStats() {
    const [stores, activeSubs, orders, revenue] = await Promise.all([
      prisma.store.count(),
      prisma.subscription.count({ where: { status: { in: ["ACTIVE", "TRIAL"] } } }),
      prisma.order.count(),
      prisma.subscription.findMany({
        where: { status: "ACTIVE" },
        include: { plan: true },
      }),
    ]);

    const mrr = revenue.reduce((sum, s) => sum + s.plan.priceMonthly, 0);

    return { stores, activeSubs, orders, mrr };
  }
}
