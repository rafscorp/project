/** Item do carrinho (client-side / cookie) */
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
  maxStock: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando",
  CONFIRMED: "Confirmado",
  PREPARING: "Separando",
  READY_FOR_PICKUP: "Pronto para retirada",
  PICKED_UP: "Retirado",
  CANCELLED: "Cancelado",
};

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  TRIAL: "Período de teste",
  ACTIVE: "Ativa",
  PAST_DUE: "Pagamento pendente",
  CANCELLED: "Cancelada",
  EXPIRED: "Expirada",
};
