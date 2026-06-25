import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ProductService } from "@/services/product.service";
import { productSchema } from "@/lib/validators/schemas";
import { SubscriptionGuard } from "@/lib/auth/subscription-guard";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.storeId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const products = await ProductService.listForDashboard(session.storeId);
    return NextResponse.json(products);
  } catch (error) {
    console.error("API GET /produtos:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.storeId || (session.role !== UserRole.STORE_OWNER && session.role !== UserRole.STORE_STAFF)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Zero-Trust: Verifica se o lojista tem plano ativo
    const canCreate = await SubscriptionGuard.canCreateProduct(session.storeId);
    if (!canCreate) {
      return NextResponse.json({ 
        error: "Sua assinatura não permite criar mais produtos ou está inativa." 
      }, { status: 403 });
    }

    const body = await request.json();
    
    // Convert price/stock to numbers before parsing if they come as strings
    if (typeof body.price === 'string') body.price = parseFloat(body.price);
    if (typeof body.comparePrice === 'string') body.comparePrice = parseFloat(body.comparePrice);
    if (typeof body.stock === 'string') body.stock = parseInt(body.stock, 10);

    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const product = await ProductService.create(session.storeId, parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("API POST /produtos:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
