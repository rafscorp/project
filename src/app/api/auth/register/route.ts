import { NextRequest, NextResponse } from "next/server";
import { registerCustomerSchema, registerStoreSchema } from "@/lib/validators/schemas";
import { AuthService } from "@/services/auth.service";
import { setSessionCookie } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 });
    }

    const type = body.type as string;
    const verificationToken = body.verificationToken as string;

    if (type === "customer") {
      if (!verificationToken) {
        return NextResponse.json({ success: false, error: "Token de verificação é obrigatório" }, { status: 400 });
      }

      // Validar Token de Email
      const validToken = await prisma.verificationToken.findFirst({
        where: { 
          email: body.email,
          token: verificationToken,
          expiresAt: { gt: new Date() }
        }
      });

      if (!validToken) {
        return NextResponse.json({ success: false, error: "Código de verificação inválido ou expirado" }, { status: 400 });
      }

      const parsed = registerCustomerSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
      }

      const user = await AuthService.registerCustomer(parsed.data);
      
      // Apagar o token já usado
      await prisma.verificationToken.delete({ where: { id: validToken.id } });
      await setSessionCookie({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        username: user.username,
      });

      return NextResponse.json({ success: true, data: { redirect: "/conta" } }, { status: 201 });
    }

    if (type === "store") {
      if (!verificationToken) {
        return NextResponse.json({ success: false, error: "Token de verificação é obrigatório" }, { status: 400 });
      }

      // Validar Token de Email
      const validToken = await prisma.verificationToken.findFirst({
        where: { 
          email: body.ownerEmail,
          token: verificationToken,
          expiresAt: { gt: new Date() }
        }
      });

      if (!validToken) {
        return NextResponse.json({ success: false, error: "Código de verificação inválido ou expirado" }, { status: 400 });
      }

      const parsed = registerStoreSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
      }

      const { owner, store, accessCode } = await AuthService.registerStore(parsed.data);
      
      // Apagar o token já usado
      await prisma.verificationToken.delete({ where: { id: validToken.id } });

      await setSessionCookie({
        userId: owner.id,
        email: owner.email,
        name: owner.name,
        role: owner.role,
        username: owner.username,
        storeId: store.id,
      });

      return NextResponse.json({
        success: true,
        data: { redirect: "/loja/painel", storeSlug: store.slug, accessCode },
      }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: "Tipo inválido" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    const status = message.includes("já cadastrado") || message.includes("em uso") || message.includes("inválido") ? 409 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
