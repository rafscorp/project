import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptionId = params.id;
    const body = await request.json();

    const { customPrice, discountPercentage, discountReason } = body;

    // Validate inputs - cannot have both custom price and percentage discount active at the same time
    if (customPrice && discountPercentage) {
      return NextResponse.json({ 
        error: "Não é possível aplicar um preço fixo e um desconto percentual simultaneamente." 
      }, { status: 400 });
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        customPrice: customPrice ? parseFloat(customPrice) : null,
        discountPercentage: discountPercentage ? parseFloat(discountPercentage) : null,
        discountReason: discountReason || null,
      },
      include: {
        store: { select: { name: true } },
        plan: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedSubscription,
    });
  } catch (error: any) {
    console.error("Error updating subscription discount:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar valores da assinatura" },
      { status: 500 }
    );
  }
}
