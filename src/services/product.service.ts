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
    const slug = input.slug || slugify(input.name);
    
    // Sanitização rigorosa contra injeções de HTML/Script
    const name = sanitizeHtml(stripHtml(input.name.trim()));
    const sku = input.sku ? sanitizeHtml(stripHtml(input.sku.trim())) : "";
    const description = input.description ? sanitizeHtml(stripHtml(input.description.trim())) : null;

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

  static async update(productId: string, storeId: string, input: Partial<ProductInput>) {
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
