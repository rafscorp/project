import prisma from "@/lib/db/prisma";
import type { CouponType, CouponScope } from "@prisma/client";

export class CouponService {
  static async create(data: {
    code: string;
    description?: string;
    type: CouponType;
    scope: CouponScope;
    value: number;
    minOrderValue?: number;
    maxDiscount?: number;
    maxUses?: number;
    maxUsesPerUser?: number;
    expiresAt?: Date;
    affiliateId?: string;
  }) {
    return prisma.coupon.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
      },
    });
  }

  static async validate(
    code: string,
    options: {
      userId?: string;
      orderValue?: number;
      scope: CouponScope;
    }
  ) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: { usages: true },
    });

    if (!coupon) return { valid: false, error: "Cupom não encontrado" };
    if (!coupon.active) return { valid: false, error: "Cupom inativo" };

    const now = new Date();
    if (coupon.startsAt > now) return { valid: false, error: "Cupom ainda não é válido" };
    if (coupon.expiresAt && coupon.expiresAt < now) return { valid: false, error: "Cupom expirado" };

    if (coupon.scope !== "ALL" && coupon.scope !== options.scope) {
      return { valid: false, error: "Cupom não aplicável para este tipo de compra" };
    }

    if (options.orderValue && coupon.minOrderValue && options.orderValue < coupon.minOrderValue) {
      return { valid: false, error: `Valor mínimo para este cupom é R$ ${coupon.minOrderValue}` };
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, error: "Cupom esgotado" };
    }

    if (options.userId && coupon.maxUsesPerUser) {
      const userUsages = coupon.usages.filter((u) => u.userId === options.userId).length;
      if (userUsages >= coupon.maxUsesPerUser) {
        return { valid: false, error: "Você já atingiu o limite de uso deste cupom" };
      }
    }

    return { valid: true, coupon };
  }

  static calculateDiscount(
    coupon: { type: CouponType; value: number; maxDiscount: number | null },
    orderValue: number
  ) {
    let discount = 0;
    if (coupon.type === "FIXED") {
      discount = coupon.value;
    } else if (coupon.type === "PERCENTAGE") {
      discount = orderValue * (coupon.value / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }
    return Math.min(discount, orderValue); // Nunca maior que o pedido
  }

  static async registerUsage(couponId: string, discount: number, userId?: string, orderId?: string) {
    return prisma.$transaction([
      prisma.couponUsage.create({
        data: { couponId, userId, orderId, discount },
      }),
      prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      }),
    ]);
  }
}
