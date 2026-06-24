import prisma from "@/lib/db/prisma";
import { slugify } from "@/lib/utils/format";
import type { ProductInput } from "@/lib/validators/schemas";

export class ProductService {
  static async listByStore(storeId: string, options?: { categoryId?: string; featured?: boolean; search?: string }) {
    return prisma.product.findMany({
      where: {
        storeId,
        active: true,
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
      where: { storeId_slug: { storeId, slug } },
      include: { category: true, store: { select: { slug: true, name: true } } },
    });
  }

  static async create(storeId: string, input: ProductInput) {
    const slug = input.slug || slugify(input.name);
    return prisma.product.create({
      data: {
        storeId,
        name: input.name,
        slug,
        sku: input.sku,
        description: input.description,
        price: input.price,
        comparePrice: input.comparePrice,
        stock: input.stock,
        categoryId: input.categoryId || null,
        active: input.active,
        featured: input.featured,
      },
    });
  }

  static async update(productId: string, storeId: string, input: Partial<ProductInput>) {
    return prisma.product.updateMany({
      where: { id: productId, storeId },
      data: input,
    });
  }

  static async delete(productId: string, storeId: string) {
    return prisma.product.deleteMany({ where: { id: productId, storeId } });
  }

  static async listForDashboard(storeId: string) {
    return prisma.product.findMany({
      where: { storeId },
      include: { category: true },
      orderBy: { updatedAt: "desc" },
    });
  }
}
