import { NextRequest, NextResponse } from "next/server";
import { registerCustomerSchema, registerStoreSchema } from "@/lib/validators/schemas";
import { AuthService } from "@/services/auth.service";
import { setSessionCookie } from "@/lib/auth/session";

/** POST /api/auth/register — type: customer | store */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const type = body.type as string;

    if (type === "customer") {
      const parsed = registerCustomerSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
      }
      const user = await AuthService.registerCustomer(parsed.data);
      await setSessionCookie({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
      return NextResponse.json({ success: true, data: { redirect: "/conta" } });
    }

    if (type === "store") {
      const parsed = registerStoreSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
      }
      const { owner, store, accessCode } = await AuthService.registerStore(parsed.data);
      await setSessionCookie({
        userId: owner.id,
        email: owner.email,
        name: owner.name,
        role: owner.role,
        storeId: store.id,
      });
      return NextResponse.json({
        success: true,
        data: { redirect: "/app", storeSlug: store.slug, accessCode },
      });
    }

    return NextResponse.json({ success: false, error: "Tipo inválido" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
