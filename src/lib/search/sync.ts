import prisma from "@/lib/db/prisma";
import { meiliClient, MEILI_INDEX_PRODUCTS } from "./meilisearch";

export async function syncProductsToMeilisearch() {
  try {
    console.log("🔄 Iniciando sincronização Prisma -> MeiliSearch...");
    
    // Busca todos os produtos ativos
    const products = await prisma.product.findMany({
      where: { active: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        vehicleTags: true,
        condition: true,
        storeId: true,
        categoryId: true,
        store: {
          select: { name: true, slug: true, logoUrl: true }
        }
      }
    });

    if (products.length === 0) {
      console.log("ℹ️ Nenhum produto para sincronizar.");
      return { success: true, count: 0 };
    }

    // Formata para o MeiliSearch
    const documents = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      imageUrl: p.imageUrl,
      vehicleTags: p.vehicleTags,
      condition: p.condition,
      storeId: p.storeId,
      categoryId: p.categoryId,
      storeName: p.store.name,
      storeSlug: p.store.slug,
      storeLogo: p.store.logoUrl,
    }));

    const index = meiliClient.index(MEILI_INDEX_PRODUCTS);
    const response = await index.addDocuments(documents);
    
    console.log(`✅ Foram enviados ${documents.length} produtos para indexação. TaskID: ${response.taskUid}`);
    return { success: true, count: documents.length, taskId: response.taskUid };
  } catch (error) {
    console.error("❌ Erro ao sincronizar MeiliSearch:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Função para buscar peças usando a Inteligência do MeiliSearch
 * Cruzando Placa/Veículo com os títulos e tags
 */
export async function searchSmartParts(query: string, vehicleTags: string[], storeId?: string) {
  try {
    const index = meiliClient.index(MEILI_INDEX_PRODUCTS);
    
    // Constrói o filtro avançado
    let filter = [];
    
    // Se o cliente tem um carro na garagem, forçamos o Meili a cruzar as tags
    if (vehicleTags.length > 0) {
      // Ex: vehicleTags IN ["Gol G4", "Universal"]
      const tagFilter = `vehicleTags IN [${vehicleTags.map(t => `"${t}"`).join(",")}, "Universal"]`;
      filter.push(tagFilter);
    }
    
    // Se estamos dentro do perfil de uma loja, restringimos o estoque
    if (storeId) {
      filter.push(`storeId = "${storeId}"`);
    }

    const searchResults = await index.search(query, {
      filter: filter.length > 0 ? filter : undefined,
      limit: 50,
      // O Meilisearch é nativamente typo-tolerant, não precisamos configurar nada mais para isso!
    });

    return { success: true, hits: searchResults.hits, estimatedTotal: searchResults.estimatedTotalHits };
  } catch (error) {
    console.error("❌ Erro na busca inteligente:", error);
    return { success: false, hits: [] };
  }
}
