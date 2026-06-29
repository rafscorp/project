import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.storeId || (session.role !== UserRole.STORE_OWNER && session.role !== UserRole.STORE_STAFF)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, code } = body;

    if (!code) {
      return NextResponse.json({ error: "Código é obrigatório" }, { status: 400 });
    }

    // Encontra o código na fila
    const queue = await prisma.orderQueue.findFirst({
      where: {
        storeId: session.storeId,
        code: code.trim().toUpperCase(),
        status: "PENDING",
        ...(id && { id }) // Se ID for passado, garante que bate
      }
    });

    if (!queue) {
      return NextResponse.json({ error: "Código inválido ou já finalizado." }, { status: 404 });
    }

    // Finaliza a venda e bloqueia o código por 30 minutos
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.orderQueue.update({
      where: { id: queue.id },
      data: {
        status: "COMPLETED",
        expiresAt
      }
    });

    // Registrar a venda no OrderService para que conte no Dashboard
    const customer = await prisma.user.findUnique({ where: { id: queue.customerId } });
    if (customer) {
      await prisma.order.create({
        data: {
          storeId: session.storeId,
          customerId: queue.customerId,
          orderNumber: `O2O-${code}-${Math.floor(Math.random() * 1000)}`,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone || "",
          customerDocument: "",
          pickupCode: code,
          total: 0, // Venda física (valor pago na loja)
          status: "COMPLETED",
          paymentMethod: "PHYSICAL", // Identificador de que foi pago na loja física
          paymentStatus: "PAID",
          shippingAddress: "RETIRADA NA LOJA",
          items: {
            create: [
              {
                productName: queue.partDescription,
                quantity: 1,
                price: 0,
                sku: "CUSTOM-PART"
              }
            ]
          }
        }
      });
    }

    return NextResponse.json({ success: true, message: "Venda finalizada com sucesso." });
  } catch (error) {
    console.error("POST /api/queue/finalize ERROR", error);
    return NextResponse.json({ error: "Erro interno ao processar" }, { status: 500 });
  }
}
