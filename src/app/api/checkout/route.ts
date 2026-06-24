import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { CouponService } from "@/services/coupon.service";
import { PaymentService } from "@/services/payment.service";
import { AffiliateService } from "@/services/affiliate.service";
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

      // Register usage early (in real app, do it after successful payment)
      await CouponService.registerUsage(appliedCouponId, discount, session.userId);
    }

    // 2. Track Affiliate if present
    if (affiliateCode) {
      await AffiliateService.registerClick(affiliateCode);
      // In real app: call AffiliateService.registerConversion after successful payment webhook
    }

    // 3. Create Subscription & Payment
    const store = await prisma.store.findFirst({ where: { ownerId: session.userId } });
    if (!store) return new NextResponse("Store not found", { status: 404 });

    const subscription = await prisma.subscription.upsert({
      where: { storeId: store.id },
      update: { planId: plan.id, status: "TRIAL" }, // Trial starts immediately
      create: { storeId: store.id, planId: plan.id, status: "TRIAL" },
    });

    const paymentResult = await PaymentService.createSubscriptionPayment(
      subscription.id,
      finalPrice,
      `Assinatura do Plano ${plan.name}`,
      session.email,
      session.name
    );

    return NextResponse.json({
      success: true,
      checkoutUrl: paymentResult.paymentUrl,
      finalPrice,
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
