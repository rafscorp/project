import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAdminSession } from "@/lib/auth/admin-session";
import { sendOfferEmail } from "@/lib/email/templates";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });

  try {
    const { storeId, discount, validDays } = await request.json();
    
    if (!storeId || !discount || !validDays) {
      return NextResponse.json({ success: false, error: "Parâmetros inválidos" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { owner: true }
    });

    if (!store) {
      return NextResponse.json({ success: false, error: "Loja não encontrada" }, { status: 404 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validDays);

    const offer = await prisma.storeOffer.create({
      data: {
        storeId,
        discountPercentage: discount,
        expiresAt
      }
    });

    // Enviar email notificando
    await sendOfferEmail(store.owner.email, store.owner.name, discount, validDays).catch(console.error);

    return NextResponse.json({ success: true, data: offer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
