import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ProductService } from "@/services/product.service";
import { productSchema } from "@/lib/validators/schemas";
import { SubscriptionGuard } from "@/lib/auth/subscription-guard";
import { UserRole } from "@prisma/client";

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
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "Lista de produtos inválida" }, { status: 400 });
    }

    // Maximum limit per import (e.g., 1000 items) to prevent timeout
    if (products.length > 1000) {
      return NextResponse.json({ error: "O limite de importação é de 1000 produtos por vez" }, { status: 400 });
    }

    const validProducts = [];
    const errors = [];

    // Parse and validate each product
    for (let i = 0; i < products.length; i++) {
      let item = products[i];
      if (typeof item.price === 'string') item.price = parseFloat(item.price);
      if (typeof item.comparePrice === 'string') item.comparePrice = parseFloat(item.comparePrice);
      if (typeof item.stock === 'string') item.stock = parseInt(item.stock, 10);
      
      const parsed = productSchema.safeParse(item);
      if (parsed.success) {
        validProducts.push(parsed.data);
      } else {
        errors.push({ row: i + 2, details: parsed.error.format() }); // +2 considering header row
      }
    }

    if (validProducts.length === 0) {
      return NextResponse.json({ error: "Nenhum produto válido encontrado no CSV.", errors }, { status: 400 });
    }

    // Pass valid products to bulkCreate
    const result = await ProductService.bulkCreate(session.storeId, validProducts);

    return NextResponse.json({ 
      success: true, 
      count: result.count, 
      errors: errors.length > 0 ? errors : undefined 
    }, { status: 201 });

  } catch (error) {
    console.error("API POST /produtos/import:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
