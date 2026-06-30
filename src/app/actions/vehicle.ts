"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function getUserVehicles(userId: string) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, vehicles };
  } catch (error) {
    console.error("Erro ao buscar veículos:", error);
    return { success: false, error: "Falha ao carregar a garagem." };
  }
}

export async function addVehicleFromPlaca(userId: string, placaStr: string) {
  try {
    const placa = placaStr.toUpperCase().replace(/[^A-Z0-9]/g, "");
    
    // Verificação Básica Anti-Spam
    const count = await prisma.vehicle.count({ where: { userId } });
    if (count >= 5) {
      return { success: false, error: "Sua garagem está cheia! Remova um carro antes de adicionar outro." };
    }

    const exists = await prisma.vehicle.findFirst({ where: { userId, placa } });
    if (exists) {
      return { success: false, error: "Este carro já está na sua garagem." };
    }

    // Aqui seria a integração com Sinesp/PlacaFipe
    // Como a API não foi fornecida, simularemos o retorno inteligente baseado na placa
    // Em produção real, você faria um `fetch("https://sua-api-de-placa.com/...")`
    
    // MOCK para testes de UI
    const isClassic = placa.startsWith("GOL");
    const mockCar = isClassic ? {
      marca: "VOLKSWAGEN",
      modelo: "GOL",
      versao: "1.0 8V TOTAL FLEX 4P",
      ano: "2010",
      cor: "PRATA",
    } : {
      marca: "CHEVROLET",
      modelo: "ONIX",
      versao: "1.0 MPFI JOY 8V FLEX 4P",
      ano: "2019",
      cor: "BRANCO",
    };

    const newVehicle = await prisma.vehicle.create({
      data: {
        userId,
        placa,
        marca: mockCar.marca,
        modelo: mockCar.modelo,
        versao: mockCar.versao,
        ano: mockCar.ano,
        cor: mockCar.cor,
      },
    });

    revalidatePath("/dashboard/garagem");
    return { success: true, vehicle: newVehicle };

  } catch (error) {
    console.error("Erro ao adicionar veículo:", error);
    return { success: false, error: "Ocorreu um erro interno ao processar a placa." };
  }
}

export async function removeVehicle(userId: string, vehicleId: string) {
  try {
    await prisma.vehicle.delete({
      where: { id: vehicleId, userId },
    });
    revalidatePath("/dashboard/garagem");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao remover veículo." };
  }
}
