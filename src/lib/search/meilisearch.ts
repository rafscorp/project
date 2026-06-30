import { MeiliSearch } from "meilisearch";
import { env } from "@/env"; // Supondo que você usa t3-env ou algo similar, senão use process.env diretamente

// Para evitar erro de 'env' se não existir no projeto:
const host = process.env.MEILISEARCH_HOST || "http://127.0.0.1:7700";
const apiKey = process.env.MEILISEARCH_MASTER_KEY || "masterKey-agury-local-dev";

export const meiliClient = new MeiliSearch({
  host,
  apiKey,
});

export const MEILI_INDEX_PRODUCTS = "products";

// Função utilitária para garantir que o Index existe e tem os Filtros configurados
export async function setupMeiliSearch() {
  try {
    const index = meiliClient.index(MEILI_INDEX_PRODUCTS);
    
    await index.updateFilterableAttributes([
      "storeId",
      "categoryId",
      "vehicleTags",
      "condition",
      "price"
    ]);

    await index.updateSearchableAttributes([
      "name",
      "description",
      "vehicleTags",
      "storeId"
    ]);

    console.log("✅ MeiliSearch Index 'products' configurado com sucesso.");
  } catch (error) {
    console.error("❌ Falha ao configurar MeiliSearch:", error);
  }
}
