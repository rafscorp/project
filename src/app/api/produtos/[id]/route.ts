import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ProductService } from "@/services/product.service";
import { productSchema } from "@/lib/validators/schemas";
import { UserRole } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getSession();
    if (!session || !session.storeId || (session.role !== UserRole.STORE_OWNER && session.role !== UserRole.STORE_STAFF)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    
    // Convert numbers if necessary
    if (typeof body.price === 'string') body.price = parseFloat(body.price);
    if (typeof body.comparePrice === 'string') body.comparePrice = parseFloat(body.comparePrice);
    if (typeof body.stock === 'string') body.stock = parseInt(body.stock, 10);

    // Using partial schema since we might only update some fields
    const parsed = productSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await ProductService.update(id, session.storeId, parsed.data);
    
    if (updated.count === 0) {
      return NextResponse.json({ error: "Produto não encontrado ou não autorizado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`API PUT /produtos/${id}:`, error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getSession();
    if (!session || !session.storeId || (session.role !== UserRole.STORE_OWNER && session.role !== UserRole.STORE_STAFF)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const deleted = await ProductService.delete(id, session.storeId);
    
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Produto não encontrado ou não autorizado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`API DELETE /produtos/${id}:`, error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
