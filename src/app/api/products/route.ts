import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { productSchema } from "@/lib/validators/schemas";
import { ProductService } from "@/services/product.service";

/** GET /api/products?storeId= — produtos da loja logada */
export async function GET() {
  const session = await getSession();
  if (!session?.storeId) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
  }

  const products = await ProductService.listForDashboard(session.storeId);
  return NextResponse.json({ success: true, data: products });
}

/** POST /api/products — criar produto */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.storeId) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const product = await ProductService.create(session.storeId, parsed.data);
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar produto";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
