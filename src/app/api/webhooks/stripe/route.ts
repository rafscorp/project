import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import crypto from "crypto";

// Mock implementation of a Stripe webhook handler
// In a real app, you would use the official Stripe SDK:
// import Stripe from "stripe";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  // In real app:
  // let event;
  // try {
  //   event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  // } catch (err: any) {
  //   return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  // }

  // Mock Event parsing
  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      
      // Update our payment record
      await prisma.payment.updateMany({
        where: { gatewayPaymentId: paymentIntent.id, gateway: "stripe" },
        data: {
          status: "PAID",
          paidAt: new Date(),
          gatewayResponse: paymentIntent,
        },
      });

      // If it's a subscription payment, update the subscription status
      const payment = await prisma.payment.findFirst({
        where: { gatewayPaymentId: paymentIntent.id, gateway: "stripe" },
        include: { subscription: true }
      });

      if (payment?.subscriptionId) {
        await prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: { status: "ACTIVE" }
        });
      }
      break;
      
    case "payment_intent.payment_failed":
      const failedIntent = event.data.object;
      await prisma.payment.updateMany({
        where: { gatewayPaymentId: failedIntent.id, gateway: "stripe" },
        data: {
          status: "FAILED",
          failedReason: failedIntent.last_payment_error?.message || "Unknown error",
          gatewayResponse: failedIntent,
        },
      });
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new NextResponse("OK", { status: 200 });
}
