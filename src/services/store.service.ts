import prisma from "@/lib/db/prisma";

/** Serviços relacionados a lojas (tenants) */
export class StoreService {
  static async getBySlug(slug: string) {
    return prisma.store.findUnique({
      where: { slug, active: true },
      include: {
        subscription: { include: { plan: true } },
        categories: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      },
    });
  }

  static async getById(id: string) {
    return prisma.store.findUnique({
      where: { id },
      include: {
        subscription: { include: { plan: true } },
        owner: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async listPublic(limit = 12) {
    return prisma.store.findMany({
      where: { active: true },
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        city: true,
        state: true,
        logoUrl: true,
      },
    });
  }

  static async updateSettings(storeId: string, data: Partial<{
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    logoUrl: string;
    bannerUrl: string;
    latitude: number;
    longitude: number;
  }>) {
    return prisma.store.update({ where: { id: storeId }, data });
  }

  /** Verifica se loja tem assinatura ativa ou em trial */
  static isSubscriptionActive(store: { subscription?: { status: string } | null }) {
    const sub = store.subscription;
    if (!sub) return false;
    return ["TRIAL", "ACTIVE"].includes(sub.status);
  }
}
