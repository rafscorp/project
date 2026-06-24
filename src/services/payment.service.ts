// =============================================================================
// Abstract Payment Provider Interface
// =============================================================================

export interface PaymentOptions {
  amount: number;
  currency?: string;
  description: string;
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, string>;
  idempotencyKey?: string;
}

export interface PaymentResult {
  success: boolean;
  gatewayPaymentId?: string;
  paymentUrl?: string; // Link para checkout (Stripe Checkout / MercadoPago Checkout)
  error?: string;
}

export interface SubscriptionOptions {
  planId: string; // ID do plano no gateway
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, string>;
}

export interface PaymentProvider {
  name: "stripe" | "mercadopago" | "mock";
  createPayment(options: PaymentOptions): Promise<PaymentResult>;
  createSubscription(options: SubscriptionOptions): Promise<PaymentResult>;
}

// =============================================================================
// Mock Provider (for development before API keys are set)
// =============================================================================

class MockPaymentProvider implements PaymentProvider {
  name = "mock" as const;

  async createPayment(options: PaymentOptions): Promise<PaymentResult> {
    console.log("[MOCK PAYMENT] Created payment for", options.amount, "to", options.customerEmail);
    return {
      success: true,
      gatewayPaymentId: `mock_pay_${Date.now()}`,
      paymentUrl: `http://localhost:3000/mock-checkout?amount=${options.amount}`,
    };
  }

  async createSubscription(options: SubscriptionOptions): Promise<PaymentResult> {
    console.log("[MOCK SUB] Created sub for plan", options.planId, "to", options.customerEmail);
    return {
      success: true,
      gatewayPaymentId: `mock_sub_${Date.now()}`,
      paymentUrl: `http://localhost:3000/mock-checkout?plan=${options.planId}`,
    };
  }
}

// =============================================================================
// Service Interface
// =============================================================================

import prisma from "@/lib/db/prisma";

export class PaymentService {
  private static provider: PaymentProvider = new MockPaymentProvider();

  // In a real implementation, we would check env vars and instantiate Stripe/MercadoPago
  // For this transformation plan, we provide the architecture ready for the API keys

  static async createSubscriptionPayment(
    subscriptionId: string,
    amount: number,
    description: string,
    customerEmail: string,
    customerName: string
  ) {
    const result = await this.provider.createPayment({
      amount,
      description,
      customerEmail,
      customerName,
      metadata: { subscriptionId },
      idempotencyKey: `sub_${subscriptionId}_${Date.now()}`
    });

    if (result.success && result.gatewayPaymentId) {
      await prisma.payment.create({
        data: {
          subscriptionId,
          amount,
          description,
          gateway: this.provider.name,
          gatewayPaymentId: result.gatewayPaymentId,
          status: "PENDING",
        }
      });
    }

    return result;
  }
}
