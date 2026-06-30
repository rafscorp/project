"use server";

import prisma from "@/lib/db/prisma";

export async function getFeedData() {
  try {
    // 1. Stories: Lojas que foram recém-criadas ou que têm produtos em destaque
    const storyStores = await prisma.store.findMany({
      where: { active: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        slug: true,
      },
    });

    // 2. Feed Posts: Produtos recentes das lojas para simular o feed do Instagram
    const feedPosts = await prisma.product.findMany({
      where: { active: true, deletedAt: null },
      take: 15,
      orderBy: { createdAt: "desc" },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            slug: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return { success: true, storyStores, feedPosts };
  } catch (error) {
    console.error("Erro ao buscar feed:", error);
    return { success: false, error: "Erro ao carregar o feed." };
  }
}
