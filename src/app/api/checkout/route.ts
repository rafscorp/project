import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { CouponService } from "@/services/coupon.service";
import { AffiliateService } from "@/services/affiliate.service";
import { AsaasService } from "@/services/asaas.service";
import prisma from "@/lib/db/prisma";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { planId, couponCode, affiliateCode } = await req.json();

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) return new NextResponse("Plan not found", { status: 404 });

    let finalPrice = plan.priceMonthly;
    let appliedCouponId = null;

    // 1. Validate Coupon
    if (couponCode) {
      const validation = await CouponService.validate(couponCode, {
        userId: session.userId,
        orderValue: plan.priceMonthly,
        scope: "SUBSCRIPTION",
      });

      if (!validation.valid || !validation.coupon) {
        return new NextResponse(validation.error || "Invalid coupon", { status: 400 });
      }

      const discount = CouponService.calculateDiscount(validation.coupon, plan.priceMonthly);
      finalPrice = Math.max(0, finalPrice - discount);
      appliedCouponId = validation.coupon.id;

      // Register usage early
      await CouponService.registerUsage(appliedCouponId, discount, session.userId);
    }

    // 2. Track Affiliate if present
    if (affiliateCode) {
      await AffiliateService.registerClick(affiliateCode);
    }

    // 3. Create Subscription & Payment via Asaas
    const store = await prisma.store.findFirst({ where: { ownerId: session.userId } });
    if (!store) return new NextResponse("Store not found", { status: 404 });

    let customerId = store.asaasCustomerId;
    if (!customerId) {
      const customer = await AsaasService.createCustomer(
        store.name, 
        store.email, 
        store.cnpj || undefined, 
        store.phone
      );
      customerId = customer.id;
      await prisma.store.update({
        where: { id: store.id },
        data: { asaasCustomerId: customerId }
      });
    }

    // Data de vencimento: hoje/amanhã
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    const nextDueDate = dueDate.toISOString().split('T')[0];

    const asaasSub = await AsaasService.createSubscription(
      customerId as string,
      finalPrice,
      nextDueDate,
      `Assinatura do Plano ${plan.name}`
    );

    await prisma.subscription.upsert({
      where: { storeId: store.id },
      update: { planId: plan.id, asaasSubscriptionId: asaasSub.id },
      create: { storeId: store.id, planId: plan.id, status: "TRIAL", asaasSubscriptionId: asaasSub.id },
    });

    // Pega o pagamento (fatura gerada)
    const paymentsRes = await AsaasService.getSubscriptionPayments(asaasSub.id);
    const firstPaymentId = paymentsRes.data?.[0]?.id;

    if (!firstPaymentId) {
      throw new Error("Não foi possível gerar a primeira cobrança da assinatura.");
    }

    // Obtém o QR Code do PIX
    const pixData = await AsaasService.getPixQrCode(firstPaymentId);

    return NextResponse.json({
      success: true,
      pixQrCode: pixData, // { encodedImage: base64, payload: brcode }
      paymentId: firstPaymentId,
      finalPrice,
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
