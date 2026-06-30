"use server";

import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface CreateAdminInput {
  name: string;
  email: string;
  username: string;
  passwordHash: string; // Senha limpa que vamos hashear aqui
}

export async function createAdminUser(input: CreateAdminInput) {
  try {
    const session = await getSession();
    if (!session || session.role !== UserRole.PLATFORM_ADMIN) {
      return { success: false, error: "Não autorizado." };
    }

    const email = input.email.toLowerCase().trim();
    const username = input.username.toLowerCase().replace(/[^a-z0-9_-]/g, "");

    // Validar se e-mail ou username já existem
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return { success: false, error: "Este e-mail já está cadastrado." };
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return { success: false, error: "Este nome de usuário já está em uso." };
    }

    const passwordHash = await hashPassword(input.passwordHash);

    await prisma.user.create({
      data: {
        name: input.name,
        email,
        username,
        passwordHash,
        role: UserRole.PLATFORM_ADMIN,
        active: true,
      }
    });

    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar admin:", error);
    return { success: false, error: "Erro interno ao cadastrar administrador." };
  }
}
