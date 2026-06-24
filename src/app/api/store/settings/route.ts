import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { StoreService } from "@/services/store.service";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.storeId) return NextResponse.json({ success: false, error: "Sessão inválida" }, { status: 401 });

    const body = await request.json();
    await StoreService.updateSettings(session.storeId, {
      name: body.name,
      description: body.description,
      phone: body.phone,
      email: body.email,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      logoUrl: body.logoUrl,
      bannerUrl: body.bannerUrl,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Erro ao salvar" }, { status: 400 });
  }
}
