import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "PLATFORM_ADMIN") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { subscriptions: { where: { status: "ACTIVE" } } }
        }
      }
    });

    return NextResponse.json(plans);
  } catch (error: any) {
    console.error("[ADMIN_PLANS_GET_ERROR]", error);
    return new NextResponse(JSON.stringify({ error: "Erro ao buscar planos" }), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "PLATFORM_ADMIN") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const data = await request.json();

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        priceMonthly: Number(data.priceMonthly),
        comparePriceMonthly: data.comparePriceMonthly ? Number(data.comparePriceMonthly) : null,
        maxProducts: Number(data.maxProducts),
        maxStaff: Number(data.maxStaff),
        features: data.features || [],
        sortOrder: Number(data.sortOrder) || 0,
        active: true
      }
    });

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error("[ADMIN_PLANS_POST_ERROR]", error);
    if (error.code === 'P2002') {
       return new NextResponse(JSON.stringify({ error: "Já existe um plano com este Slug" }), { status: 400 });
    }
    return new NextResponse(JSON.stringify({ error: "Erro ao criar plano" }), { status: 500 });
  }
}
