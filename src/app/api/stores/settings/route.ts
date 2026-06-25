import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { UserRole } from "@prisma/client";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== UserRole.STORE_OWNER && session.role !== UserRole.STORE_STAFF) || !session.storeId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { phone, address, description, logoUrl, bannerUrl } = body;

    // Atualiza os dados da loja no banco de dados
    const updatedStore = await prisma.store.update({
      where: { id: session.storeId },
      data: {
        phone: phone !== undefined ? phone : undefined,
        address: address !== undefined ? address : undefined,
        description: description !== undefined ? description : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        bannerUrl: bannerUrl !== undefined ? bannerUrl : undefined,
      },
    });

    return NextResponse.json(updatedStore);
  } catch (error) {
    console.error("PATCH /api/stores/settings ERROR", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
