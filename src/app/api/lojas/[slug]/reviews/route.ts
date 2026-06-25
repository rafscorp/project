import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { UserRole } from "@prisma/client";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const session = await getSession();
    if (!session || session.role !== UserRole.CUSTOMER) {
      return NextResponse.json({ error: "Apenas clientes podem avaliar lojas" }, { status: 401 });
    }

    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Nota inválida" }, { status: 400 });
    }

    // Buscar a loja pelo slug
    const store = await prisma.store.findUnique({
      where: { slug },
    });

    if (!store) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 });
    }

    // Verificar se o usuário já avaliou esta loja
    const existingReview = await prisma.storeReview.findUnique({
      where: {
        storeId_userId: {
          storeId: store.id,
          userId: session.userId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json({ error: "Você já avaliou esta loja" }, { status: 400 });
    }

    // Usando transação para criar a avaliação e atualizar a média da loja
    await prisma.$transaction(async (tx) => {
      // 1. Criar a avaliação
      await tx.storeReview.create({
        data: {
          storeId: store.id,
          userId: session.userId,
          rating,
          comment: comment ? comment.trim() : null,
        },
      });

      // 2. Recalcular a média
      const aggregations = await tx.storeReview.aggregate({
        where: { storeId: store.id },
        _avg: { rating: true },
        _count: { id: true },
      });

      const newAverage = aggregations._avg.rating || 0;
      const totalReviews = aggregations._count.id || 0;

      // 3. Atualizar a loja
      await tx.store.update({
        where: { id: store.id },
        data: {
          averageRating: newAverage,
          totalReviews: totalReviews,
        },
      });
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("API POST /reviews:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Você já avaliou esta loja." }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
