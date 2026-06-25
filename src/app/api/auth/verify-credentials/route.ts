import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import prisma from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";

/** POST /api/auth/verify-credentials */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 });
    }

    if (!body.email || !body.password) {
      return NextResponse.json({ success: false, error: "E-mail e senha são obrigatórios" }, { status: 400 });
    }

    const email = body.email.toLowerCase();
    
    // Buscar usuário
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) {
      // Retorna genérico para evitar enumeração
      return NextResponse.json({ success: false, error: "E-mail ou senha incorretos" }, { status: 401 });
    }

    // Verificar senha
    const isValid = await verifyPassword(body.password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "E-mail ou senha incorretos" }, { status: 401 });
    }

    // Gerar e enviar o código 2FA
    await AuthService.sendLoginCode(email);

    return NextResponse.json({ success: true, requiresCode: true });
  } catch (error) {
    console.error("Verify Credentials Error:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
