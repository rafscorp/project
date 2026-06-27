import { stripe } from "@/lib/payments/stripe";
import { mpPayment } from "@/lib/payments/mercadopago";
import prisma from "@/lib/db/prisma";
import { env } from "@/lib/env";

export class PaymentService {
  /**
   * Gera uma sessão de checkout no Stripe para Assinatura de Planos (SaaS)
   */
  static async createSubscriptionPayment(
    subscriptionId: string,
    amount: number,
    description: string,
    customerEmail: string,
    customerName: string
  ) {
    // Se o valor for zero, redireciona direto para o painel com sucesso
    if (amount <= 0) {
      return { paymentUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard?status=success` };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: description,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      client_reference_id: subscriptionId,
      success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?status=success`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/pagamento?status=cancelled`,
      metadata: {
        subscriptionId,
      },
    });

    return { paymentUrl: session.url };
  }

  /**
   * Gera uma sessão de checkout no Stripe (Cartões) para Pedidos
   */
  static async createStripeCheckout(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true, items: { include: { product: true } } },
    });

    if (!order) throw new Error("Pedido não encontrado");
    if (order.paymentStatus === "PAID") throw new Error("Pedido já pago");

    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: item.product.name,
          description: `Vendido por: ${order.store.name}`,
        },
        unit_amount: Math.round(item.unitPrice * 100), // Stripe em centavos
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      customer_email: order.customerEmail,
      client_reference_id: order.id,
      success_url: `${env.NEXT_PUBLIC_APP_URL}/loja/${order.store.slug}/checkout/sucesso?order=${order.orderNumber}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/loja/${order.store.slug}/checkout/cancelado?order=${order.orderNumber}`,
      metadata: {
        orderId: order.id,
        storeId: order.storeId,
      },
    });

    // Registra a tentativa de pagamento
    await prisma.payment.create({
      data: {
        amount: order.total,
        currency: "BRL",
        status: "PENDING",
        gateway: "stripe",
        gatewayPaymentId: session.id,
        description: `Pagamento do Pedido ${order.orderNumber}`,
      },
    });

    return session.url;
  }

  /**
   * Gera uma cobrança de Pix no Mercado Pago
   */
  static async createPixPayment(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true },
    });

    if (!order) throw new Error("Pedido não encontrado");
    if (order.paymentStatus === "PAID") throw new Error("Pedido já pago");

    const payment = await mpPayment.create({
      body: {
        transaction_amount: order.total,
        description: `Pedido ${order.orderNumber} - ${order.store.name}`,
        payment_method_id: "pix",
        payer: {
          email: order.customerEmail,
          first_name: order.customerName.split(" ")[0] || "Cliente",
          last_name: order.customerName.split(" ").slice(1).join(" ") || "Agury",
        },
        external_reference: order.id,
      },
    });

    if (!payment.id) throw new Error("Falha ao gerar PIX");

    await prisma.payment.create({
      data: {
        amount: order.total,
        currency: "BRL",
        status: "PENDING",
        gateway: "mercadopago",
        gatewayPaymentId: payment.id.toString(),
        description: `PIX do Pedido ${order.orderNumber}`,
      },
    });

    return {
      qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
      qrCodeCopyPaste: payment.point_of_interaction?.transaction_data?.qr_code,
      paymentId: payment.id.toString(),
    };
  }

  /**
   * Processa Webhook do Stripe
   */
  static async handleStripeWebhook(event: any) {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      
      if (orderId && session.payment_status === "paid") {
        await this.confirmOrderPayment(orderId, "stripe", session.id);
      }
    }
  }

  static async handleMercadoPagoWebhook(paymentId: string) {
    const paymentInfo = await mpPayment.get({ id: paymentId });
    if (paymentInfo.status === "approved" && paymentInfo.external_reference) {
      const placaPurchase = await prisma.placaQueryPurchase.findUnique({
        where: { id: paymentInfo.external_reference }
      });

      if (placaPurchase) {
        if (placaPurchase.paymentStatus === "PENDING") {
          await prisma.$transaction([
            prisma.placaQueryPurchase.update({
              where: { id: placaPurchase.id },
              data: { paymentStatus: "PAID", paidAt: new Date() }
            }),
            prisma.user.update({
              where: { id: placaPurchase.userId },
              data: { placaCredits: { increment: placaPurchase.creditsAdded } }
            }),
            prisma.auditLog.create({
              data: {
                userId: placaPurchase.userId,
                action: "PLACA_PURCHASE",
                metadata: { amount: placaPurchase.amountPaid, credits: placaPurchase.creditsAdded }
              }
            })
          ]);
          console.log(`[PAYMENT VERIFICATION SUCESSO] Compra de Placa ${placaPurchase.id} confirmada.`);
        }
      } else {
        await this.confirmOrderPayment(paymentInfo.external_reference, "mercadopago", paymentId);
      }
    }
  }

  private static async confirmOrderPayment(orderId: string, gateway: string, gatewayPaymentId: string) {
    try {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        console.error(`[PAYMENT VERIFICATION ERRO] Pedido não encontrado: ${orderId}`);
        return;
      }

      if (order.paymentStatus === "PAID") {
        console.log(`[PAYMENT VERIFICATION SKIP] Pedido ${orderId} já estava marcado como pago.`);
        return;
      }

      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "PAID", status: "CONFIRMED" },
        }),
        prisma.payment.updateMany({
          where: { gatewayPaymentId, gateway },
          data: { status: "PAID", paidAt: new Date() },
        }),
        prisma.auditLog.create({
          data: {
            action: "PAYMENT_CREATE",
            entity: "Order",
            entityId: orderId,
            metadata: { gateway, gatewayPaymentId, amount: order.total, note: "Webhook confirmou o pagamento com sucesso." }
          }
        })
      ]);

      console.log(`[PAYMENT VERIFICATION SUCESSO] Pedido ${orderId} pago via ${gateway}.`);
    } catch (error) {
      console.error(`[CRITICAL] Falha catastrófica ao confirmar pagamento do pedido ${orderId}:`, error);
      throw error;
    }
  }
}
