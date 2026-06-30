import { env } from "@/env.mjs";

// Pegando do process.env pois env.mjs pode não ter asaas configurado ainda se não foi feito update no zod schema.
const ASAAS_URL = process.env.ASAAS_API_URL || "https://sandbox.asaas.com/api/v3";
const API_KEY = process.env.ASAAS_API_KEY;

export class AsaasService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!API_KEY) throw new Error("ASAAS_API_KEY não configurada no ambiente. Configure no painel do administrador ou no arquivo .env.");
    
    const url = `${ASAAS_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "access_token": API_KEY,
      ...(options.headers || {}),
    };

    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    
    if (!res.ok) {
      console.error("[Asaas Error]", JSON.stringify(data, null, 2));
      throw new Error(data.errors?.[0]?.description || "Erro na comunicação com o Asaas");
    }
    
    return data as T;
  }

  /**
   * Cria ou atualiza um cliente no Asaas.
   */
  static async createCustomer(name: string, email: string, cpfCnpj?: string | null, phone?: string | null) {
    return this.request<any>("/customers", {
      method: "POST",
      body: JSON.stringify({ 
        name, 
        email, 
        cpfCnpj: cpfCnpj || undefined, 
        phone: phone || undefined 
      }),
    });
  }

  /**
   * Cria uma assinatura recorrente cobrada via PIX.
   * Retorna os dados da Subscription criada no Asaas.
   */
  static async createSubscription(
    customerId: string, 
    value: number, 
    nextDueDate: string, 
    description: string
  ) {
    return this.request<any>("/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        customer: customerId,
        billingType: "PIX",
        value,
        nextDueDate, // formato YYYY-MM-DD
        cycle: "MONTHLY",
        description,
      }),
    });
  }

  /**
   * Obtém as cobranças de uma assinatura
   */
  static async getSubscriptionPayments(subscriptionId: string) {
    return this.request<any>(`/subscriptions/${subscriptionId}/payments`);
  }

  /**
   * Obtém o QRCode PIX dinâmico de uma cobrança gerada pela assinatura
   */
  static async getPixQrCode(paymentId: string) {
    return this.request<any>(`/payments/${paymentId}/pixQrCode`);
  }
}
