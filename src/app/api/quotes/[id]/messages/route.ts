import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { UserRole } from "@prisma/client";
import { sanitizeHtml, stripHtml } from "@/lib/security/sanitize";

// GET: Retorna as mensagens de um QuoteRequest
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await context.params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const quote = await prisma.quoteRequest.findUnique({
      where: { id: quoteId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: { sender: { select: { id: true, name: true, role: true } } },
        },
      },
    });

    if (!quote) return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });

    // Verifica permissão (Cliente do pedido ou dono da loja)
    const isCustomer = session.role === UserRole.CUSTOMER && quote.customerId === session.userId;
    const isStore = (session.role === UserRole.STORE_OWNER || session.role === UserRole.STORE_STAFF) && quote.storeId === session.storeId;

    if (!isCustomer && !isStore) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json(quote.messages);
  } catch (error) {
    console.error("GET /api/quotes/[id]/messages ERROR", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST: Envia uma nova mensagem no chat do orçamento
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await context.params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Conteúdo inválido" }, { status: 400 });
    }

    // Sanitiza contra HTML/JS malicioso para evitar stored XSS
    const sanitizedContent = sanitizeHtml(stripHtml(content.trim()));

    if (!sanitizedContent) {
      return NextResponse.json({ error: "Mensagem vazia após sanitização" }, { status: 400 });
    }

    const quote = await prisma.quoteRequest.findUnique({
      where: { id: quoteId },
    });

    if (!quote) return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });

    // Verifica permissão
    const isCustomer = session.role === UserRole.CUSTOMER && quote.customerId === session.userId;
    const isStore = (session.role === UserRole.STORE_OWNER || session.role === UserRole.STORE_STAFF) && quote.storeId === session.storeId;

    if (!isCustomer && !isStore) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Cria a mensagem
    const message = await prisma.quoteMessage.create({
      data: {
        quoteRequestId: quoteId,
        senderId: session.userId,
        content: sanitizedContent,
      },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });

    // Opcional: Atualizar o updatedAt do QuoteRequest para subir na lista
    await prisma.quoteRequest.update({
      where: { id: quoteId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("POST /api/quotes/[id]/messages ERROR", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
