import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { mpPayment } from "@/lib/payments/mercadopago";
import { z } from "zod";

const purchaseSchema = z.object({
  planId: z.string().cuid("ID do plano inválido"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = purchaseSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { planId } = parsed.data;

    const plan = await prisma.placaQueryPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.active) {
      return NextResponse.json({ error: "Plano inválido ou inativo." }, { status: 400 });
    }

    // Cria registro de compra PENDING no banco
    const purchase = await prisma.placaQueryPurchase.create({
      data: {
        userId: session.userId,
        planId: plan.id,
        creditsAdded: plan.credits,
        amountPaid: plan.price,
        paymentStatus: "PENDING",
      },
    });

    // Cria pagamento PIX no Mercado Pago
    let payment;
    try {
      payment = await mpPayment.create({
        body: {
          transaction_amount: plan.price,
          payment_method_id: "pix",
          payer: {
            email: session.email,
            first_name: session.name.split(" ")[0],
          },
          description: `Agury - ${plan.name} (${plan.credits} créditos)`,
          external_reference: purchase.id,
        },
      });
    } catch (mpError) {
      console.error("[MercadoPago Error]", mpError);
      return NextResponse.json({ error: "Erro ao gerar PIX no gateway de pagamento." }, { status: 502 });
    }

    const qrCodeBase64 = payment.point_of_interaction?.transaction_data?.qr_code_base64;
    const qrCode = payment.point_of_interaction?.transaction_data?.qr_code;
    const mpPaymentId = payment.id?.toString();

    if (!qrCodeBase64 || !qrCode || !mpPaymentId) {
       return NextResponse.json({ error: "Gateway não retornou dados do PIX." }, { status: 502 });
    }

    // Atualiza a compra com os dados do PIX
    const updatedPurchase = await prisma.placaQueryPurchase.update({
      where: { id: purchase.id },
      data: {
        pixQrCode: qrCodeBase64,
        pixCopiaECola: qrCode,
        mpPaymentId: mpPaymentId,
      },
    });

    return NextResponse.json({
      purchaseId: updatedPurchase.id,
      qrCodeBase64: updatedPurchase.pixQrCode,
      copiaECola: updatedPurchase.pixCopiaECola,
      amount: updatedPurchase.amountPaid,
    });
  } catch (error) {
    console.error("[Placa Purchase POST]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
