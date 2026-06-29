import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators/schemas";
import { AuthService } from "@/services/auth.service";
import { setSessionCookie } from "@/lib/auth/session";
import { isCurrentlyBlocked, incrementRateLimit, RATE_LIMITS } from "@/lib/auth/rate-limiter";

/** POST /api/auth/login */
export async function POST(request: NextRequest) {
  // Atraso artificial de 2 segundos para dificultar brute-force sem dar erro explícito 
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 });
    }

    const email = body.email;
    const rateLimitKey = typeof email === "string" ? `login_fail_${email.trim().toLowerCase()}` : null;

    // Se o email já estourou o limite de 10 tentativas, bloqueia imediatamente sem tentar o login
    if (rateLimitKey && isCurrentlyBlocked(rateLimitKey, RATE_LIMITS.loginFailed)) {
      return NextResponse.json(
        { success: false, error: "Sua conta foi bloqueada por 10 minutos após muitas tentativas incorretas." },
        { status: 429 }
      );
    }

    // Função auxiliar para registrar falhas
    const handleFailure = (errorMsg: string, status = 401) => {
      if (rateLimitKey) {
        incrementRateLimit(rateLimitKey, RATE_LIMITS.loginFailed);
      }
      return NextResponse.json({ success: false, error: errorMsg }, { status });
    };

    // Se estivermos no fluxo 2FA (tem código)
    if (body.code) {
      if (!body.email) {
        return NextResponse.json({ success: false, error: "E-mail obrigatório" }, { status: 400 });
      }
      
      const session = await AuthService.login({ email: body.email, password: "", code: body.code });
      if (!session) {
        return handleFailure("Código inválido ou expirado");
      }

      await setSessionCookie(session);

      const redirect =
        session.role === "PLATFORM_ADMIN" ? "/admin" :
        session.role === "STORE_OWNER" || session.role === "STORE_STAFF" ? "/loja/painel" :
        "/conta";

      return NextResponse.json({ success: true, data: { redirect } });
    }

    // Fluxo normal
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const session = await AuthService.login({ ...parsed.data });
    if (!session) {
      return handleFailure("E-mail ou senha incorretos");
    }

    await setSessionCookie(session);

    const redirect =
      session.role === "PLATFORM_ADMIN" ? "/admin" :
      session.role === "STORE_OWNER" || session.role === "STORE_STAFF" ? "/loja/painel" :
      "/conta";

    return NextResponse.json({ success: true, data: { redirect } });
  } catch (err) {
    console.error("Erro no login:", err);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
