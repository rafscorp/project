import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { encryptField, decryptField } from "@/lib/security/encryption";

// =============================================================================
// GET  /api/vehicles — Lista os veículos da garagem do usuário autenticado
// POST /api/vehicles — Salva um novo veículo (dados vindos da API de placa)
// =============================================================================

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    // Decifra os campos PII antes de retornar ao cliente
    const decrypted = vehicles.map((v) => ({
      id: v.id,
      placa: v.placa,
      marca: v.marca,
      modelo: v.modelo,
      ano: v.ano,
      cor: v.cor,
      combustivel: v.combustivel,
      versao: v.versao,
      cidade: v.cidade,
      chassi: decryptField(v.chassiEnc),
      motor: decryptField(v.motorEnc),
      ownerName: decryptField(v.ownerNameEnc),
      createdAt: v.createdAt,
    }));

    return NextResponse.json(decrypted);
  } catch (error) {
    console.error("[API GET /vehicles]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      placa, marca, modelo, ano, cor,
      combustivel, versao, cidade,
      chassi, motor, ownerName,
    } = body;

    // Validação mínima
    if (!placa || !marca || !modelo) {
      return NextResponse.json(
        { error: "Dados incompletos: placa, marca e modelo são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanPlaca = String(placa).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    // Impede duplicata — veículo com essa placa já salvo por este usuário
    const existing = await prisma.vehicle.findFirst({
      where: { userId: session.userId, placa: cleanPlaca },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Este veículo já está na sua garagem." },
        { status: 409 }
      );
    }

    // Encripta campos PII antes da persistência (AES-256-GCM)
    const chassiEnc = encryptField(chassi || "—");
    const motorEnc = encryptField(motor || "—");
    const ownerNameEnc = encryptField(ownerName || "—");

    const vehicle = await prisma.vehicle.create({
      data: {
        userId: session.userId,
        placa: cleanPlaca,
        marca: String(marca).toUpperCase(),
        modelo: String(modelo).toUpperCase(),
        ano: String(ano || "—"),
        cor: String(cor || "—").toUpperCase(),
        combustivel: String(combustivel || "—"),
        versao: String(versao || "—"),
        cidade: String(cidade || "—"),
        chassiEnc,
        motorEnc,
        ownerNameEnc,
      },
    });

    // Retorna ao cliente SEM os campos PII encriptados (apenas os metadados)
    return NextResponse.json({
      id: vehicle.id,
      placa: vehicle.placa,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      ano: vehicle.ano,
      cor: vehicle.cor,
      combustivel: vehicle.combustivel,
      versao: vehicle.versao,
      saved: true,
    }, { status: 201 });

  } catch (error) {
    console.error("[API POST /vehicles]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
