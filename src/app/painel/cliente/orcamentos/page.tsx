import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { UserRole } from "@prisma/client";
import { CustomerQuotesClient } from "./CustomerQuotesClient";

export default async function CustomerQuotesPage() {
  const session = await getSession();

  if (!session || session.role !== UserRole.CUSTOMER) {
    redirect("/login");
  }

  const quotes = await prisma.quoteRequest.findMany({
    where: { customerId: session.userId },
    include: {
      store: { select: { name: true, slug: true, city: true, state: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-foreground">Meus Orçamentos</h1>
          <p className="text-muted-foreground mt-1">Acompanhe as respostas das lojas para as peças que você solicitou.</p>
        </div>
      </div>

      <CustomerQuotesClient initialQuotes={quotes} />
    </div>
  );
}
