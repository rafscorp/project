import crypto from "crypto";
import prisma from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { SessionPayload } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import type { LoginInput, RegisterCustomerInput, RegisterStoreInput } from "@/lib/validators/schemas";
import { sendStoreRegistrationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendLoginCodeEmail } from "@/lib/email/templates";

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
      if (!input.password) return null;
      valid = await verifyPassword(input.password, user.passwordHash);
    }

    if (!valid) return null;

    const payload: SessionPayload = {
      userId: user.id,
      email: user.email,
      username: user.username || user.email.split("@")[0],
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

    const username = input.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    const user = await prisma.user.create({
      data: {
        username,
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        passwordHash: await hashPassword(input.password),
        birthDate: input.birthDate ? new Date(input.birthDate) : null,
        city: input.city || null,
        role: UserRole.CUSTOMER,
      },
    });

    void sendWelcomeEmail(user.email, user.name).catch((error) => {
      console.error("Falha ao enviar e-mail de boas-vindas:", error);
    });

    return user;
  }

  /** Cadastro de empresa + loja + assinatura trial */
  static async registerStore(input: RegisterStoreInput) {
    const email = input.ownerEmail.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new Error("E-mail já cadastrado");

    const slugExists = await prisma.store.findUnique({ where: { slug: input.slug } });
    if (slugExists) throw new Error("Este endereço de loja já está em uso");

    const plan = await prisma.subscriptionPlan.findFirst({ orderBy: { sortOrder: 'asc' } });
    if (!plan) throw new Error("Erro interno ao buscar planos");

    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await prisma.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          username: `${email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")}-${Math.random().toString(36).slice(2, 6)}`,
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
          status: "EXPIRED",
        },
      });

      await tx.storeMember.create({
        data: { storeId: store.id, userId: owner.id, role: "owner" },
      });

      return { owner, store, accessCode };
    });

    void sendStoreRegistrationEmail(result.owner.email, result.owner.name, result.store.name, result.accessCode).catch((error) => {
      console.error("Falha ao enviar e-mail de cadastro da loja:", error);
    });

    return result;
  }

  /** Solicitar reset de senha — gera token e envia email */
  static async requestPasswordReset(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return false; // Silent fail to prevent enumeration

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await sendPasswordResetEmail(user.email, token);
    return true;
  }

  /** Redefinir senha usando token */
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return false;
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return true;
  }

  /** Enviar código de login por email */
  static async sendLoginCode(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return false;

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginCode: code,
        loginCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    await sendLoginCodeEmail(user.email, user.name, code);
    return true;
  }
}
