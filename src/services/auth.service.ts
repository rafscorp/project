import prisma from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { SessionPayload } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import type { LoginInput, RegisterCustomerInput, RegisterStoreInput } from "@/lib/validators/schemas";
import { slugify } from "@/lib/utils/format";

export class AuthService {
  /** Login — retorna payload para sessão ou null se inválido */
  static async login(input: LoginInput & { code?: string }): Promise<SessionPayload | null> {
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user || !user.active) return null;

    let valid = false;
    if (input.code) {
      const now = new Date();
      const codeValid = !!user.loginCode && !!user.loginCodeExpiresAt && user.loginCodeExpiresAt > now && user.loginCode === input.code;
      if (codeValid) {
        await prisma.user.update({
          where: { id: user.id },
          data: { loginCode: null, loginCodeExpiresAt: null },
        });
        valid = true;
      }
    } else {
      valid = await verifyPassword(input.password, user.passwordHash);
    }

    if (!valid) return null;

    const payload: SessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // Se lojista, inclui storeId da primeira loja
    if (user.role === UserRole.STORE_OWNER || user.role === UserRole.STORE_STAFF) {
      const store = await prisma.store.findFirst({
        where: user.role === UserRole.STORE_OWNER
          ? { ownerId: user.id }
          : { members: { some: { userId: user.id } } },
      });
      if (store) payload.storeId = store.id;
    }

    return payload;
  }

  /** Cadastro de cliente final */
  static async registerCustomer(input: RegisterCustomerInput) {
    const exists = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (exists) throw new Error("E-mail já cadastrado");

    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        passwordHash: await hashPassword(input.password),
        role: UserRole.CUSTOMER,
      },
    });
  }

  /** Cadastro de empresa + loja + assinatura trial */
  static async registerStore(input: RegisterStoreInput) {
    const email = input.ownerEmail.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new Error("E-mail já cadastrado");

    const slugExists = await prisma.store.findUnique({ where: { slug: input.slug } });
    if (slugExists) throw new Error("Este endereço de loja já está em uso");

    const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: input.planSlug } });
    if (!plan) throw new Error("Plano inválido");

    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

    return prisma.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          name: input.ownerName,
          email,
          phone: input.ownerPhone,
          passwordHash: await hashPassword(input.password),
          loginCode: accessCode,
          loginCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
          role: UserRole.STORE_OWNER,
        },
      });

      const store = await tx.store.create({
        data: {
          slug: input.slug,
          name: input.storeName,
          cnpj: input.cnpj,
          phone: input.phone,
          email: input.email.toLowerCase(),
          address: input.address,
          city: input.city,
          state: input.state.toUpperCase(),
          zipCode: input.zipCode,
          ownerId: owner.id,
        },
      });

      await tx.subscription.create({
        data: {
          storeId: store.id,
          planId: plan.id,
          status: "TRIAL",
          trialEndsAt: trialEnd,
          currentPeriodEnd: trialEnd,
        },
      });

      await tx.storeMember.create({
        data: { storeId: store.id, userId: owner.id, role: "owner" },
      });

      return { owner, store, accessCode };
    });
  }
}
