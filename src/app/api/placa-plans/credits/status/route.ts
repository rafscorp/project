import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkPlacaCredits } from "@/lib/placa/credits";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creditStatus = await checkPlacaCredits(session.userId);
    return NextResponse.json(creditStatus);
  } catch (error) {
    console.error("[Credits Status GET]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
