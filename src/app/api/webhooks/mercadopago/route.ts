import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/services/payment.service";
import crypto from "crypto";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dataId = url.searchParams.get("data.id") || (await req.json()).data?.id;

    if (!dataId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Processar o Webhook de pagamento via PaymentService
    await PaymentService.handleMercadoPagoWebhook(dataId);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error processing MercadoPago webhook:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
