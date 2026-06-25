import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validators/schemas";
import { AuthService } from "@/services/auth.service";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/auth/rate-limiter";

/** POST /api/auth/reset-password */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`reset-pass:${ip}`, RATE_LIMITS.passwordReset);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Muitas tentativas de redefinição. Tente novamente mais tarde." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 });
    }

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const success = await AuthService.resetPassword(parsed.data.token, parsed.data.password);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Token inválido ou expirado. Solicite uma nova redefinição." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Senha redefinida com sucesso." },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
