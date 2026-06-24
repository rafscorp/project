import prisma from "@/lib/db/prisma";
import { generateOrderNumber, generatePickupCode } from "@/lib/utils/format";
import type { CheckoutInput } from "@/lib/validators/schemas";
import type { OrderStatus } from "@prisma/client";

export class OrderService {
  /** Cria pedido — cliente retira na loja (sem entrega) */
  static async create(storeId: string, input: CheckoutInput, customerId?: string) {
    const productIds = input.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, storeId, active: true },
    });

    if (products.length !== input.items.length) {
      throw new Error("Um ou mais produtos não estão disponíveis");
    }

    const items = input.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        throw new Error(`Estoque insuficiente: ${product.name}`);
      }
      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        total: product.price * item.quantity,
      };
    });

    const subtotal = items.reduce((s, i) => s + i.total, 0);

    return prisma.$transaction(async (tx) => {
      // Baixa estoque
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          storeId,
          customerId: customerId || null,
          customerName: input.customerName,
          customerEmail: input.customerEmail.toLowerCase(),
          customerPhone: input.customerPhone,
          subtotal,
          total: subtotal,
          pickupCode: generatePickupCode(),
          notes: input.notes,
          items: { create: items },
        },
        include: { items: { include: { product: true } } },
      });

      return order;
    });
  }

  static async listByStore(storeId: string, status?: OrderStatus) {
    return prisma.order.findMany({
      where: { storeId, ...(status && { status }) },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  static async listByCustomer(customerId: string) {
    return prisma.order.findMany({
      where: { customerId },
      include: {
        items: { include: { product: true } },
        store: { select: { name: true, slug: true, address: true, phone: true, city: true, state: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateStatus(orderId: string, storeId: string, status: OrderStatus) {
    return prisma.order.updateMany({
      where: { id: orderId, storeId },
      data: { status },
    });
  }

  static async getByPickupCode(storeId: string, pickupCode: string) {
    return prisma.order.findFirst({
      where: { storeId, pickupCode: pickupCode.toUpperCase() },
      include: { items: { include: { product: true } } },
    });
  }
}
