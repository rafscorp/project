import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/services/payment.service";
import crypto from "crypto";
import { env } from "@/lib/env";
import { z } from "zod";

const mpWebhookSchema = z.object({
  data: z.object({
    id: z.string().min(1)
  })
}).passthrough();

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let dataId = url.searchParams.get("data.id");

    if (!dataId) {
      const body = await req.json().catch(() => ({}));
      const parsed = mpWebhookSchema.safeParse(body);
      if (parsed.success) {
        dataId = parsed.data.data.id;
      }
    }

    if (!dataId) {
      return NextResponse.json({ error: "Invalid payload: missing data.id" }, { status: 400 });
    }

    // Processar o Webhook de pagamento via PaymentService
    await PaymentService.handleMercadoPagoWebhook(dataId);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error processing MercadoPago webhook:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
