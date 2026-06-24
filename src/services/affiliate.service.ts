import prisma from "@/lib/db/prisma";
import crypto from "crypto";

export class AffiliateService {
  static async create(userId: string) {
    // Generate a unique referral code based on user's name or a random string
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Usuário não encontrado");

    const baseCode = user.username.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const randomSuffix = crypto.randomBytes(2).toString("hex").toUpperCase();
    const code = `REF-${baseCode}-${randomSuffix}`;

    return prisma.affiliate.create({
      data: {
        userId,
        code,
        commissionRate: parseFloat(process.env.AFFILIATE_DEFAULT_COMMISSION || "10"),
      },
    });
  }

  static async registerClick(code: string) {
    return prisma.affiliate.update({
      where: { code },
      data: { totalClicks: { increment: 1 } },
    });
  }

  static async registerConversion(code: string, referredStoreId: string, amount: number) {
    const affiliate = await prisma.affiliate.findUnique({ where: { code } });
    if (!affiliate || affiliate.status !== "APPROVED") return null;

    const commission = amount * (affiliate.commissionRate / 100);

    return prisma.$transaction([
      prisma.affiliateReferral.create({
        data: {
          affiliateId: affiliate.id,
          referredStoreId,
          converted: true,
          commission,
        },
      }),
      prisma.affiliate.update({
        where: { id: affiliate.id },
        data: { totalEarnings: { increment: commission } },
      }),
    ]);
  }

  static async requestPayout(affiliateId: string, amount: number, pixKey: string) {
    const affiliate = await prisma.affiliate.findUnique({ where: { id: affiliateId } });
    if (!affiliate) throw new Error("Afiliado não encontrado");

    const availableBalance = affiliate.totalEarnings - affiliate.totalPaid;
    if (amount > availableBalance) throw new Error("Saldo insuficiente");

    return prisma.affiliatePayment.create({
      data: {
        affiliateId,
        amount,
        pixKey,
        status: "PENDING",
      },
    });
  }
}
