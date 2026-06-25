import prisma from "@/lib/db/prisma";

/** Serviços relacionados a lojas (tenants) */
export class StoreService {
  static async getBySlug(slug: string) {
    return prisma.store.findUnique({
      where: { slug, active: true },
      include: {
        subscription: { include: { plan: true } },
        categories: { where: { active: true }, orderBy: { sortOrder: "asc" } },
        reviews: {
          include: { user: { select: { name: true, avatarUrl: true } } },
          orderBy: { createdAt: "desc" },
        },
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

  /** Verifica se loja deve estar visível publicamente (Active ou Soft Lock) */
  static isSubscriptionActive(store: { subscription?: { status: string, currentPeriodEnd?: Date | null } | null }) {
    const status = this.getFomoStatus(store);
    return status === "ACTIVE" || status === "SOFT_LOCK";
  }

  /** Retorna o status psicológico da assinatura para travar o painel */
  static getFomoStatus(store: { subscription?: { status: string, currentPeriodEnd?: Date | null } | null }): "ACTIVE" | "SOFT_LOCK" | "HARD_LOCK" {
    const sub = store.subscription;
    if (!sub) return "HARD_LOCK";
    
    if (["TRIAL", "ACTIVE"].includes(sub.status)) {
      if (sub.currentPeriodEnd) {
        const now = new Date();
        if (now > sub.currentPeriodEnd) {
          const daysPastDue = Math.floor((now.getTime() - sub.currentPeriodEnd.getTime()) / (1000 * 3600 * 24));
          if (daysPastDue >= 5) return "HARD_LOCK";
          return "SOFT_LOCK";
        }
      }
      return "ACTIVE";
    }
    
    if (sub.status === "PAST_DUE") {
      if (sub.currentPeriodEnd) {
        const now = new Date();
        const daysPastDue = Math.floor((now.getTime() - sub.currentPeriodEnd.getTime()) / (1000 * 3600 * 24));
        if (daysPastDue >= 5) return "HARD_LOCK";
        return "SOFT_LOCK";
      }
      return "SOFT_LOCK"; // Fallback se não tiver data mas tá PAST_DUE
    }

    return "HARD_LOCK";
  }
}
