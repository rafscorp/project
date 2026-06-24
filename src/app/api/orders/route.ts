import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkoutSchema } from "@/lib/validators/schemas";
import { OrderService } from "@/services/order.service";
import prisma from "@/lib/db/prisma";

/** POST /api/orders — criar pedido (checkout) */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeSlug, ...checkoutData } = body;

    const store = await prisma.store.findUnique({ where: { slug: storeSlug, active: true } });
    if (!store) {
      return NextResponse.json({ success: false, error: "Loja não encontrada" }, { status: 404 });
    }

    const parsed = checkoutSchema.safeParse(checkoutData);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const session = await getSession();
    const order = await OrderService.create(
      store.id,
      parsed.data,
      session?.role === "CUSTOMER" ? session.userId : undefined
    );

    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar pedido";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

/** GET /api/orders?storeId= — listar pedidos da loja */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.storeId) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status") as Parameters<typeof OrderService.listByStore>[1];
  const orders = await OrderService.listByStore(session.storeId, status || undefined);
  return NextResponse.json({ success: true, data: orders });
}
