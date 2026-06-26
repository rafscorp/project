import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { verify2FAToken, decrypt2FASecret } from "@/lib/auth/2fa";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limiter";

// =============================================================================
// POST /api/auth/2fa/verify
// Valida o token TOTP e ativa o 2FA na conta (se ainda não ativo).
// Também é usado para confirmar o 2FA no login (challenge).
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Rate limiting — máximo 5 tentativas/minuto por IP
    const ip = getClientIp(request.headers);
    const rl = checkRateLimit(`2fa:verify:${session.userId}:${ip}`, {
      maxRequests: 5,
      windowSeconds: 60,
      blockSeconds: 300, // Bloqueia 5 minutos após 5 falhas
    });

    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Muitas tentativas. Aguarde ${Math.ceil((rl.retryAfterSeconds ?? 300) / 60)} minutos.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token obrigatório." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user?.twoFactorSecret) {
      return NextResponse.json(
        { error: "Configure o 2FA primeiro em /configuracoes." },
        { status: 400 }
      );
    }

    // Decifra o secret para validação
    const plaintextSecret = decrypt2FASecret(user.twoFactorSecret);
    const isValid = await verify2FAToken(plaintextSecret, token);

    if (!isValid) {
      return NextResponse.json(
        { error: "Código inválido ou expirado. Tente novamente." },
        { status: 401 }
      );
    }

    // Ativa o 2FA se ainda não estava ativo (fluxo de setup)
    if (!user.twoFactorEnabled) {
      await prisma.user.update({
        where: { id: session.userId },
        data: {
          twoFactorEnabled: true,
          twoFactorVerifiedAt: new Date(),
        },
      });
    } else {
      // Fluxo de challenge (login já existente com 2FA) — apenas atualiza timestamp
      await prisma.user.update({
        where: { id: session.userId },
        data: { twoFactorVerifiedAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      activated: !user.twoFactorEnabled, // true se acabou de ser ativado
    });
  } catch (error) {
    console.error("[API POST /auth/2fa/verify]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
