import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const plans = await prisma.placaQueryPlan.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error("[Placa Plans GET]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
