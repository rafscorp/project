import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth/session";

/**
 * Cria um Stripe Setup Intent
 * Isso é usado para o "Cofre de Cartão" (Card Vaulting).
 * O Stripe faz a verificação (autorização de $0 ou $1 estornado) 
 * e salva o cartão no Customer para cobranças futuras.
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifySessionToken(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, customerId } = await req.json();

    let stripeCustomerId = customerId;

    // Se não enviou o ID do Stripe, cria um novo Customer no Stripe
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: email || session.email,
        metadata: {
          userId: session.userId
        }
      });
      stripeCustomerId = customer.id;
    }

    // Cria o SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session', // Garante que podemos cobrar sem a pessoa estar no site
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId: stripeCustomerId
    });

  } catch (error: any) {
    console.error("SetupIntent Error:", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
