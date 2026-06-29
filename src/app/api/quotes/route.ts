import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { UserRole } from "@prisma/client";
import { sanitizeHtml, stripHtml } from "@/lib/security/sanitize";
import { sendO2OCodeEmail, sendO2OStoreEmail } from "@/lib/email/templates";

// GET: Lista orçamentos baseado no papel do usuário logado
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    if (session.role === UserRole.CUSTOMER) {
      const quotes = await prisma.quoteRequest.findMany({
        where: { customerId: session.userId },
        include: { store: { select: { name: true, slug: true, logoUrl: true, city: true, state: true } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(quotes);
    } 
    
    if (session.role === UserRole.STORE_OWNER || session.role === UserRole.STORE_STAFF) {
      if (!session.storeId) return NextResponse.json({ error: "Loja não encontrada na sessão" }, { status: 403 });
      const quotes = await prisma.quoteRequest.findMany({
        where: { storeId: session.storeId },
        include: { customer: { select: { name: true, email: true, phone: true } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(quotes);
    }

    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  } catch (error) {
    console.error("GET /api/quotes ERROR", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST: Cliente cria um pedido de orçamento (com sanitização rigorosa)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== UserRole.CUSTOMER) {
      return NextResponse.json({ error: "Apenas clientes podem solicitar orçamentos" }, { status: 401 });
    }

    const body = await request.json();
    const { storeId, vehicle, year, part } = body;

    if (!storeId || !vehicle || !part) {
      return NextResponse.json({ error: "Dados inválidos ou incompletos" }, { status: 400 });
    }

    // Sanitização anti-XSS e anti-HTML em todos os campos inseridos no banco
    const sanitizedVehicle = sanitizeHtml(stripHtml(vehicle.trim()));
    const sanitizedYear = year ? sanitizeHtml(stripHtml(String(year).trim())) : null;
    const sanitizedPart = sanitizeHtml(stripHtml(part.trim()));
    const sanitizedStoreId = sanitizeHtml(stripHtml(storeId.trim()));

    const quote = await prisma.quoteRequest.create({
      data: {
        customerId: session.userId,
        storeId: sanitizedStoreId,
        vehicle: sanitizedVehicle,
        year: sanitizedYear,
        part: sanitizedPart,
      },
    });

    // -------------------------------------------------------------------------
    // O2O Queue System: Generate 5-character Code (4 digits + 1 uppercase letter)
    // -------------------------------------------------------------------------
    let code = "";
    let isUnique = false;
    
    while (!isUnique) {
      const numbers = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digits
      const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
      code = numbers + letter;
      
      const existing = await prisma.orderQueue.findFirst({
        where: {
          storeId: sanitizedStoreId,
          code,
          OR: [
            { status: "PENDING" },
            { expiresAt: { gt: new Date() } } // Still locked
          ]
        }
      });
      if (!existing) isUnique = true;
    }

    const orderQueue = await prisma.orderQueue.create({
      data: {
        storeId: sanitizedStoreId,
        customerId: session.userId,
        code,
        partDescription: `${sanitizedVehicle} - Peça: ${sanitizedPart}`,
        status: "PENDING"
      }
    });

    // Fetch store and user details for emails
    const [store, customer] = await Promise.all([
      prisma.store.findUnique({ where: { id: sanitizedStoreId }, include: { owner: true } }),
      prisma.user.findUnique({ where: { id: session.userId } })
    ]);

    if (store && customer) {
      const mapsLink = `https://www.google.com/maps?q=${encodeURIComponent(`${store.address}, ${store.city} - ${store.state}`)}`;
      
      // Send Email to Customer with the Code
      sendO2OCodeEmail(customer.email, customer.name, store.name, code, mapsLink).catch(console.error);
      
      // Send Email to Store notifying them of the new Lead
      sendO2OStoreEmail(store.owner.email, store.name, customer.name, sanitizedVehicle, sanitizedPart).catch(console.error);
    }

    return NextResponse.json({ ...quote, o2oCode: code }, { status: 201 });
  } catch (error) {
    console.error("POST /api/quotes ERROR", error);
    return NextResponse.json({ error: "Erro interno ao processar solicitação" }, { status: 500 });
  }
}
