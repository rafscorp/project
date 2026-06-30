"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function getChatRooms(userId: string, role: "customer" | "store") {
  try {
    const rooms = await prisma.chatRoom.findMany({
      where: role === "customer" ? { customerId: userId } : { storeId: userId },
      include: {
        customer: { 
          select: { 
            id: true, 
            name: true, 
            avatarUrl: true,
            birthDate: true,
            city: true,
            createdAt: true
          } 
        },
        store: { select: { id: true, name: true, logoUrl: true } },
        product: { select: { id: true, name: true, imageUrl: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Pega a última mensagem para preview
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return { success: true, rooms };
  } catch (error) {
    console.error("Erro ao buscar salas de chat:", error);
    return { success: false, error: "Erro interno ao carregar conversas." };
  }
}

export async function getMessages(roomId: string) {
  try {
    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    return { success: true, messages };
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return { success: false, error: "Erro ao carregar histórico." };
  }
}

export async function createMessage(roomId: string, senderId: string, content: string) {
  try {
    const message = await prisma.message.create({
      data: { roomId, senderId, content },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Atualiza o updatedAt da sala para subir na lista
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    return { success: true, message };
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return { success: false, error: "Falha ao enviar mensagem." };
  }
}

export async function findOrCreateChatRoom(customerId: string, storeId: string, productId?: string) {
  try {
    let room = await prisma.chatRoom.findFirst({
      where: {
        customerId,
        storeId,
        productId: productId || null,
      },
    });

    if (!room) {
      room = await prisma.chatRoom.create({
        data: { customerId, storeId, productId },
      });
    }

    return { success: true, room };
  } catch (error) {
    console.error("Erro ao iniciar conversa:", error);
    return { success: false, error: "Não foi possível iniciar o chat." };
  }
}
