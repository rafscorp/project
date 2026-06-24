import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { OrderService } from "@/services/order.service";
import type { OrderStatus } from "@prisma/client";

/** PATCH /api/orders/[id] — atualizar status do pedido */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.storeId) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  await OrderService.updateStatus(id, session.storeId, status as OrderStatus);
  return NextResponse.json({ success: true });
}
