import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";

const sendCodeSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = sendCodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email } = parsed.data;

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Salvar ou atualizar no banco
    await prisma.verificationToken.upsert({
      where: { token: code }, // Na verdade, deveríamos buscar por e-mail e deletar os antigos, mas o schema define token como unique.
      update: {},
      create: {
        email,
        token: code,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
      },
    });

    // TODO: Disparar E-mail Real (Integrar provedor de e-mail)
    console.log(`[DEV MODE] Código de Verificação para ${email}: ${code}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Erro ao enviar código de verificação:", err);
    return NextResponse.json({ success: false, error: "Erro interno ao enviar código" }, { status: 500 });
  }
}
