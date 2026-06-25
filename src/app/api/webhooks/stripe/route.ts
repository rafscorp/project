import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/services/payment.service";
import { env } from "@/lib/env";
import { stripe } from "@/lib/payments/stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET || "whsec_mock"
    );
  } catch (err: any) {
    console.error("Stripe Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  try {
    await PaymentService.handleStripeWebhook(event);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error processing Stripe webhook:", err);
    return NextResponse.json({ error: "Error processing webhook" }, { status: 500 });
  }
}
