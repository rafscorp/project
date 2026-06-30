import { GoogleGenAI, Type, Schema } from "@google/genai";
import prisma from "@/lib/db/prisma";
import { searchSmartParts } from "@/lib/search/sync";

// Inicializa o SDK do Gemini usando a nova biblioteca recomendada
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy-key" });

/**
 * Função principal do Agente de Inteligência Artificial da ConectaParts.
 * Ele atua como Concierge para o Cliente e Analista para o Admin/Lojista.
 */
export async function runAIAgent(userMessage: string, userId: string, role: string) {
  try {
    // Definimos as ferramentas (Functions) que a IA pode usar no backend
    const tools = [
      {
        functionDeclarations: [
          {
            name: "verifyStorePlan",
            description: "Verifica se uma loja pagou a assinatura e se o plano está ativo.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                storeSlug: {
                  type: Type.STRING,
                  description: "O slug ou nome da loja para verificar",
                },
              },
              required: ["storeSlug"],
            } as Schema,
          },
          {
            name: "searchPartsForUser",
            description: "Faz uma busca inteligente de peças cruzando com o veículo do cliente na garagem virtual.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                partName: {
                  type: Type.STRING,
                  description: "Nome da peça procurada (ex: Amortecedor)",
                },
              },
              required: ["partName"],
            } as Schema,
          },
        ],
      },
    ];

    const systemInstruction = `
      Você é a IA Concierge da ConectaParts (Marketplace Automotivo).
      O usuário falando com você tem o cargo de: ${role}.
      
      Regras:
      1. Se o usuário for um CLIENTE procurando peças, use a ferramenta 'searchPartsForUser'.
      2. Se o usuário for ADMIN ou CEO perguntando sobre o status de lojas, use 'verifyStorePlan'.
      3. Seja sempre direto, profissional e focado no mercado automotivo.
      4. Você tem capacidade para atender 1000+ dispositivos simultaneamente pois é baseada no modelo Gemini Flash, projetado para alta velocidade e baixo custo.
    `;

    // Criamos um chat que suporta tool calling
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction,
        tools,
        temperature: 0.3,
      },
    });

    // Envia a mensagem do usuário para o modelo
    let response = await chat.sendMessage({ message: userMessage });

    // Se o modelo decidiu chamar uma função:
    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const call of response.functionCalls) {
        if (call.name === "verifyStorePlan") {
          const storeSlug = call.args.storeSlug as string;
          const store = await prisma.store.findUnique({
            where: { slug: storeSlug },
            include: { subscription: { include: { plan: true } } },
          });

          const resultStr = store 
            ? `Loja encontrada: ${store.name}. Plano: ${store.subscription?.plan.name || "Nenhum"}. Status: ${store.subscription?.status || "INATIVO"}`
            : `Loja '${storeSlug}' não encontrada no banco de dados.`;

          // Devolve o resultado da função para o modelo gerar a resposta final
          response = await chat.sendMessage({
            message: [{
              functionResponse: {
                name: "verifyStorePlan",
                response: { result: resultStr }
              }
            }]
          });
        }
        
        if (call.name === "searchPartsForUser") {
          const partName = call.args.partName as string;
          
          // Pegar o veículo principal da garagem do cliente
          const vehicles = await prisma.vehicle.findMany({ where: { userId } });
          const tags = vehicles.length > 0 ? [`${vehicles[0].marca} ${vehicles[0].modelo}`] : [];

          // Executa a busca no Meilisearch cruzando as tags!
          const searchResult = await searchSmartParts(partName, tags);

          const resultStr = searchResult.success 
            ? `Foram encontradas ${searchResult.estimatedTotal} peças compatíveis com a garagem do usuário. Top 3 itens: ${searchResult.hits.slice(0,3).map((h: any) => h.name).join(", ")}`
            : "Nenhuma peça compatível encontrada no momento.";

          response = await chat.sendMessage({
            message: [{
              functionResponse: {
                name: "searchPartsForUser",
                response: { result: resultStr }
              }
            }]
          });
        }
      }
    }

    return { success: true, answer: response.text };

  } catch (error) {
    console.error("Erro na IA:", error);
    return { success: false, error: "Falha na comunicação com o concierge de IA." };
  }
}
