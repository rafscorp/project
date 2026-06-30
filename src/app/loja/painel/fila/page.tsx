import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { FilaClient } from "./FilaClient";

export default async function FilaDeClientesPage() {
  const session = await getSession();
  if (!session?.storeId) redirect("/login");

  // Fetch pending items
  const pendingQueues = await prisma.orderQueue.findMany({
    where: { storeId: session.storeId, status: "PENDING" },
    include: { 
      customer: { 
        select: { 
          id: true,
          name: true, 
          username: true,
          phone: true 
        } 
      } 
    },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Fila de Clientes</h1>
        <p className="text-sm text-muted-foreground">Valide os códigos de compra dos clientes físicos e efetive suas vendas.</p>
      </div>

      <FilaClient initialQueues={pendingQueues} storeId={session.storeId} />
    </div>
  );
}
