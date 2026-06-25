import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { StoreService } from "@/services/store.service";
import ProductsClient from "./ProductsClient";

export const dynamic = 'force-dynamic';

export default async function ProductsServerPage() {
  const session = await getSession();
  if (!session || !session.storeId) redirect("/login");

  const store = await StoreService.getById(session.storeId);
  if (!store) redirect("/login");

  if (StoreService.getFomoStatus(store) === "HARD_LOCK") {
    redirect("/dashboard/pagamento");
  }

  // Se a assinatura for válida, envia o HTML do painel completo!
  return <ProductsClient />;
}
