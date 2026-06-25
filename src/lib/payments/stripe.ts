import Stripe from "stripe";
import { env } from "@/lib/env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2026-06-24.dahlia" as any,
  typescript: true,
});
