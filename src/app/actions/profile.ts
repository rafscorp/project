"use server";

import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

interface UpdateProfileInput {
  name: string;
  username: string;
  phone?: string;
  avatarUrl?: string;
}

export async function updateProfile(input: UpdateProfileInput) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Não autorizado." };
    }

    const cleanUsername = input.username.toLowerCase().replace(/[^a-z0-9_-]/g, "");

    // Verifica se username já existe para outro usuário
    const exists = await prisma.user.findFirst({
      where: {
        username: cleanUsername,
        id: { not: session.userId }
      }
    });

    if (exists) {
      return { success: false, error: "Nome de usuário já está em uso." };
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: input.name,
        username: cleanUsername,
        phone: input.phone || null,
        avatarUrl: input.avatarUrl || null,
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    return { success: false, error: "Erro interno ao atualizar perfil." };
  }
}
