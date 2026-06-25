import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validators/schemas";
import { AuthService } from "@/services/auth.service";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/auth/rate-limiter";

/** POST /api/auth/send-code */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rateLimit = checkRateLimit(ip, RATE_LIMITS.passwordReset);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 });
    }

    // Reuse forgotPasswordSchema since it's the same { email } shape
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    // Silent — always returns success to prevent email enumeration
    await AuthService.sendLoginCode(parsed.data.email).catch(() => {});

    return NextResponse.json({
      success: true,
      data: { message: "Se o e-mail existir, enviaremos um código de acesso." },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
