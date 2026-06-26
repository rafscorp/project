import { NextRequest, NextResponse } from "next/server";
import { checkServiceStatus } from "@/lib/security/circuit-breaker";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const status = await checkServiceStatus("placa-api");
    return NextResponse.json({
      available: status.available,
      message: status.available ? "Serviço ativo" : "Função de pesquisa por placas indisponível",
    });
  } catch (error) {
    console.error("[API Placa Status]", error);
    // Em caso de erro, retornamos ativo para não bloquear o fluxo principal à toa
    return NextResponse.json({
      available: true,
      message: "Serviço ativo (fallback)",
    });
  }
}
