import { z } from "zod";
import { ProductCondition } from "@prisma/client";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional(),
  code: z.string().length(6, "Código inválido").optional(),
}).refine((data) => Boolean(data.password || data.code), {
  message: "Informe a senha ou o código de acesso",
  path: ["password"],
});

export const registerCustomerSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export const registerStoreSchema = z.object({
  ownerName: z.string().min(2),
  ownerEmail: z.string().email(),
  ownerPhone: z.string().min(10),
  password: z.string().min(6),
  storeName: z.string().min(2),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug só pode ter letras minúsculas, números e hífens"),
  cnpj: z.string().min(14, "CNPJ inválido").optional(),
  phone: z.string().min(10),
  email: z.string().email(),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().length(2),
  zipCode: z.string().min(8).optional(),
  planSlug: z.string().default("starter"),
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  stock: z.number().int().min(0),
  imageUrl: z.string().url().optional(),
  condition: z.nativeEnum(ProductCondition).default(ProductCondition.NEW),
  categoryId: z.string().optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirme sua senha"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;
export type RegisterStoreInput = z.infer<typeof registerStoreSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
