import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators/schemas";
import { AuthService } from "@/services/auth.service";
import { setSessionCookie } from "@/lib/auth/session";

/** POST /api/auth/login */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 });
    }

    // Se estivermos no fluxo 2FA (tem código)
    if (body.code) {
      if (!body.email) {
        return NextResponse.json({ success: false, error: "E-mail obrigatório" }, { status: 400 });
      }
      
      const session = await AuthService.login({ email: body.email, password: "", code: body.code });
      if (!session) {
        return NextResponse.json({ success: false, error: "Código inválido ou expirado" }, { status: 401 });
      }

      await setSessionCookie(session);

      const redirect =
        session.role === "PLATFORM_ADMIN" ? "/admin" :
        session.role === "STORE_OWNER" || session.role === "STORE_STAFF" ? "/loja/painel" :
        "/conta";

      return NextResponse.json({ success: true, data: { redirect } });
    }

    // Fluxo normal (fallback, caso seja necessário no futuro, ou remover)
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const session = await AuthService.login({ ...parsed.data });
    if (!session) {
      return NextResponse.json({ success: false, error: "E-mail ou senha incorretos" }, { status: 401 });
    }

    await setSessionCookie(session);

    const redirect =
      session.role === "PLATFORM_ADMIN" ? "/admin" :
      session.role === "STORE_OWNER" || session.role === "STORE_STAFF" ? "/loja/painel" :
      "/conta";

    return NextResponse.json({ success: true, data: { redirect } });
  } catch {
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
