import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/services/payment.service";

/**
 * POST /api/checkout/order
 * Inicia o fluxo de pagamento de um pedido do cliente para o lojista
 * body: { orderId: string, gateway: "stripe" | "mercadopago" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, gateway } = body;

    if (!orderId || !gateway) {
      return NextResponse.json({ success: false, error: "Dados incompletos" }, { status: 400 });
    }

    if (gateway === "stripe") {
      const checkoutUrl = await PaymentService.createStripeCheckout(orderId);
      return NextResponse.json({ success: true, data: { url: checkoutUrl } });
    }

    if (gateway === "mercadopago") {
      const pixData = await PaymentService.createPixPayment(orderId);
      return NextResponse.json({ success: true, data: pixData });
    }

    return NextResponse.json({ success: false, error: "Gateway inválido" }, { status: 400 });
  } catch (error: any) {
    console.error("Erro no checkout de pedido:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
