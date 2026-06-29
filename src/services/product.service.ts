import prisma from "@/lib/db/prisma";
import { slugify } from "@/lib/utils/format";
import type { ProductInput } from "@/lib/validators/schemas";
import { sanitizeHtml, stripHtml } from "@/lib/security/sanitize";

export class ProductService {
  static async listByStore(storeId: string, options?: { categoryId?: string; featured?: boolean; search?: string }) {
    return prisma.product.findMany({
      where: {
        storeId,
        active: true,
        deletedAt: null,
        ...(options?.categoryId && { categoryId: options.categoryId }),
        ...(options?.featured && { featured: true }),
        ...(options?.search && {
          OR: [
            { name: { contains: options.search } },
            { description: { contains: options.search } },
            { sku: { contains: options.search } },
          ],
        }),
      },
      include: { category: true },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });
  }

  static async getBySlug(storeId: string, slug: string) {
    return prisma.product.findUnique({
      where: { storeId_slug: { storeId, slug }, deletedAt: null },
      include: { category: true, store: { select: { slug: true, name: true } } },
    });
  }

  static async create(storeId: string, input: ProductInput) {
    const slug = input.slug || slugify(input.name) + "-" + Math.random().toString(36).substring(2, 8);
    
    const name = sanitizeHtml(stripHtml(input.name.trim()));
    const sku = input.sku ? sanitizeHtml(stripHtml(input.sku.trim())) : "";
    const description = input.description ? sanitizeHtml(stripHtml(input.description.trim())) : null;

    // Strict Limit Enforcement
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { 
        subscription: { include: { plan: true } },
        owner: true
      }
    });

    if (store && store.subscription && !["ACTIVE", "TRIAL"].includes(store.subscription.status)) {
      throw new Error("Modo Vitrine: Assine um plano para adicionar produtos.");
    }

    if (store && store.subscription?.plan) {
      const maxProducts = store.subscription.plan.maxProducts;
      const currentProductsCount = await prisma.product.count({
        where: { storeId, deletedAt: null }
      });

      if (currentProductsCount >= maxProducts) {
        // Send email and create notification asynchronously
        import("@/lib/email/templates").then(({ sendLimitExceededEmail }) => {
          sendLimitExceededEmail(store.owner.email, store.owner.name, store.name).catch(console.error);
        });

        throw new Error(`Limite excedido: Seu plano permite no máximo ${maxProducts} peças. Faça o upgrade para continuar cadastrando!`);
      }
    }

    return prisma.product.create({
      data: {
        storeId,
        name,
        slug,
        sku,
        description,
        price: input.price,
        comparePrice: input.comparePrice,
        stock: input.stock,
        imageUrl: input.imageUrl,
        categoryId: input.categoryId || null,
        condition: input.condition || "NEW",
        active: input.active ?? true,
        featured: input.featured ?? false,
      },
    });
  }

  static async bulkCreate(storeId: string, products: ProductInput[]) {
    const data = products.map((input) => {
      const name = sanitizeHtml(stripHtml(input.name.trim()));
      const sku = input.sku ? sanitizeHtml(stripHtml(input.sku.trim())) : "";
      const description = input.description ? sanitizeHtml(stripHtml(input.description.trim())) : null;
      
      // Prevent slug conflicts during mass import by appending random strings
      const slug = (input.slug || slugify(name)) + "-" + Math.random().toString(36).substring(2, 8);
      
      return {
        storeId,
        name,
        slug,
        sku,
        description,
        price: input.price,
        comparePrice: input.comparePrice,
        stock: input.stock ?? 1,
        imageUrl: input.imageUrl,
        categoryId: input.categoryId || null,
        condition: input.condition || "NEW",
        active: input.active ?? true,
        featured: input.featured ?? false,
      };
    });

    // Strict Limit Enforcement for Bulk Import
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { 
        subscription: { include: { plan: true } },
        owner: true
      }
    });

    if (store && store.subscription && !["ACTIVE", "TRIAL"].includes(store.subscription.status)) {
      throw new Error("Modo Vitrine: Assine um plano para adicionar produtos em massa.");
    }

    if (store && store.subscription?.plan) {
      const maxProducts = store.subscription.plan.maxProducts;
      const currentProductsCount = await prisma.product.count({
        where: { storeId, deletedAt: null }
      });

      if (currentProductsCount + data.length > maxProducts) {
        // Send email and create notification asynchronously
        import("@/lib/email/templates").then(({ sendLimitExceededEmail }) => {
          sendLimitExceededEmail(store.owner.email, store.owner.name, store.name).catch(console.error);
        });

        throw new Error(`Limite excedido: Seu plano permite no máximo ${maxProducts} peças. Você está tentando adicionar mais do que o permitido. Faça o upgrade para continuar!`);
      }
    }

    return prisma.product.createMany({
      data,
      skipDuplicates: true,
    });
  }

  static async update(productId: string, storeId: string, input: Partial<ProductInput>) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { subscription: true }
    });

    if (store && store.subscription && !["ACTIVE", "TRIAL"].includes(store.subscription.status)) {
      throw new Error("Modo Vitrine: Assine um plano para editar produtos.");
    }

    const data: any = { ...input };

    // Sanitiza strings do payload de atualização se existirem
    if (data.name) {
      data.name = sanitizeHtml(stripHtml(data.name.trim()));
    }
    if (data.sku) {
      data.sku = sanitizeHtml(stripHtml(data.sku.trim()));
    }
    if (data.description) {
      data.description = sanitizeHtml(stripHtml(data.description.trim()));
    }

    return prisma.product.updateMany({
      where: { id: productId, storeId },
      data,
    });
  }

  static async delete(productId: string, storeId: string) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { subscription: true }
    });

    if (store && store.subscription && !["ACTIVE", "TRIAL"].includes(store.subscription.status)) {
      throw new Error("Modo Vitrine: Assine um plano para excluir produtos.");
    }

    return prisma.product.updateMany({
      where: { id: productId, storeId },
      data: { deletedAt: new Date(), active: false },
    });
  }

  static async listForDashboard(storeId: string) {
    return prisma.product.findMany({
      where: { storeId, deletedAt: null },
      include: { category: true },
      orderBy: { updatedAt: "desc" },
    });
  }
}
