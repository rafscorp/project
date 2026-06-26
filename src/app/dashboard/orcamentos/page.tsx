import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { UserRole } from "@prisma/client";
import { QuotesClient } from "./QuotesClient";
import { StoreService } from "@/services/store.service";

export default async function StoreQuotesPage() {
  const session = await getSession();

  if (!session || !session.storeId || (session.role !== UserRole.STORE_OWNER && session.role !== UserRole.STORE_STAFF)) {
    redirect("/login");
  }

  const store = await StoreService.getById(session.storeId);
  if (!store) redirect("/login");

  if (StoreService.getFomoStatus(store) === "HARD_LOCK") {
    redirect("/dashboard/pagamento");
  }

  const fomoStatus = store ? StoreService.getFomoStatus(store) : "HARD_LOCK";

  const quotes = await prisma.quoteRequest.findMany({
    where: { storeId: session.storeId },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-foreground">Pedidos de Orçamento</h1>
          <p className="text-muted-foreground mt-1">Gerencie os pedidos de clientes e envie propostas para fechar vendas.</p>
        </div>
      </div>

      <QuotesClient initialQuotes={quotes} isSoftLocked={fomoStatus === "SOFT_LOCK"} />
    </div>
  );
}
