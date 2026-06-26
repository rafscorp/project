import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { generate2FASecret, encrypt2FASecret } from "@/lib/auth/2fa";

// =============================================================================
// GET /api/auth/2fa/setup
// Gera um novo secret TOTP e retorna o QR Code para o usuário escanear.
// O secret ainda NÃO está ativo — é ativado após verificação em /2fa/verify.
// =============================================================================

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA já está ativado na sua conta." },
        { status: 409 }
      );
    }

    // Gera secret + QR Code
    const { secret, qrCodeDataUrl, otpAuthUrl } = await generate2FASecret(user.email);

    // Armazena o secret (ainda não ativado — twoFactorEnabled = false)
    // encriptado via AES-256-GCM
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        twoFactorSecret: encrypt2FASecret(secret),
        twoFactorEnabled: false, // Ativado somente após verificação
      },
    });

    // Retorna QR Code e URI — NUNCA o secret plaintext
    return NextResponse.json({ qrCodeDataUrl, otpAuthUrl });
  } catch (error) {
    console.error("[API GET /auth/2fa/setup]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
