import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { UserRole, QuoteStatus } from "@prisma/client";
import { sanitizeHtml, stripHtml } from "@/lib/security/sanitize";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await context.params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();

    const quote = await prisma.quoteRequest.findUnique({
      where: { id: quoteId },
    });

    if (!quote) return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });

    // Lojista respondendo
    if (session.role === UserRole.STORE_OWNER || session.role === UserRole.STORE_STAFF) {
      if (quote.storeId !== session.storeId) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }

      const { priceOffer, message, status } = body;
      
      // Sanitiza mensagem do lojista se houver
      const sanitizedMessage = message ? sanitizeHtml(stripHtml(String(message).trim())) : quote.message;

      const updatedQuote = await prisma.quoteRequest.update({
        where: { id: quoteId },
        data: {
          priceOffer: priceOffer ? parseFloat(priceOffer) : quote.priceOffer,
          message: sanitizedMessage,
          status: status || QuoteStatus.ANSWERED,
        },
      });

      return NextResponse.json(updatedQuote);
    }

    // Cliente respondendo (Aceitando ou Rejeitando)
    if (session.role === UserRole.CUSTOMER) {
      if (quote.customerId !== session.userId) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }

      const { status } = body;
      if (status !== QuoteStatus.ACCEPTED && status !== QuoteStatus.REJECTED) {
        return NextResponse.json({ error: "Status inválido" }, { status: 400 });
      }

      const updatedQuote = await prisma.quoteRequest.update({
        where: { id: quoteId },
        data: { status },
      });

      return NextResponse.json(updatedQuote);
    }

    return NextResponse.json({ error: "Ação não permitida" }, { status: 403 });
  } catch (error) {
    console.error("PATCH /api/quotes/[id] ERROR", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
