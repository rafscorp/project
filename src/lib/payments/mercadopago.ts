import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { env } from "@/lib/env";

export const mercadoPagoConfig = new MercadoPagoConfig({
  accessToken: env.MERCADOPAGO_ACCESS_TOKEN || "TEST-mock-token",
});

export const mpPreference = new Preference(mercadoPagoConfig);
export const mpPayment = new Payment(mercadoPagoConfig);

interface CreatePixRequest {
  transactionAmount: number;
  description: string;
  payerEmail: string;
  payerName: string;
  externalReference: string;
}

export async function createPixPayment({
  transactionAmount,
  description,
  payerEmail,
  payerName,
  externalReference,
}: CreatePixRequest) {
  try {
    const payment = await mpPayment.create({
      body: {
        transaction_amount: transactionAmount,
        description: description,
        payment_method_id: "pix",
        payer: {
          email: payerEmail,
          first_name: payerName,
        },
        external_reference: externalReference,
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      },
    });

    return {
      success: true,
      data: {
        id: payment.id,
        qrCode: payment.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
        ticketUrl: payment.point_of_interaction?.transaction_data?.ticket_url,
      },
    };
  } catch (error) {
    console.error("Erro ao gerar PIX:", error);
    return { success: false, error: "Falha ao comunicar com Mercado Pago." };
  }
}
