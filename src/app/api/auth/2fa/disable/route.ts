import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { verify2FAToken, decrypt2FASecret } from "@/lib/auth/2fa";

// =============================================================================
// POST /api/auth/2fa/disable
// Desativa o 2FA — exige token TOTP válido como confirmação de segurança.
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Código de autenticação obrigatório para desativar o 2FA." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user?.twoFactorEnabled || !user?.twoFactorSecret) {
      return NextResponse.json(
        { error: "O 2FA não está ativado na sua conta." },
        { status: 400 }
      );
    }

    // Valida o token antes de desativar
    const plaintextSecret = decrypt2FASecret(user.twoFactorSecret);
    const isValid = await verify2FAToken(plaintextSecret, token);

    if (!isValid) {
      return NextResponse.json(
        { error: "Código inválido. O 2FA não foi desativado." },
        { status: 401 }
      );
    }

    // Desativa e apaga o secret (dados sensíveis não devem permanecer desnecessariamente)
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorVerifiedAt: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API POST /auth/2fa/disable]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
