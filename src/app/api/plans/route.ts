import { NextResponse } from "next/server";
import { SubscriptionService } from "@/services/subscription.service";

/** GET /api/plans — listar planos públicos */
export async function GET() {
  const plans = await SubscriptionService.listPlans();
  return NextResponse.json({ success: true, data: plans });
}
