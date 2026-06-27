import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { Users, Search, ShoppingBag, ExternalLink, Mail, Phone } from "lucide-react";

export default async function CRMClientesPage() {
  const session = await getSession();
  if (!session || !session.storeId) redirect("/login");

  // Busca todos os pedidos da loja e agrupa por cliente
  const orders = await prisma.order.findMany({
    where: { storeId: session.storeId },
    select: {
      customerId: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      total: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Agrupamento em memória para montar a visão de CRM
  const clientsMap = new Map<string, {
    name: string;
    email: string;
    phone: string;
    totalSpent: number;
    orderCount: number;
    lastOrderDate: Date;
  }>();

  orders.forEach(order => {
    // Usamos o email como chave caso customerId seja nulo (vendas avulsas/guests)
    const key = order.customerId || order.customerEmail;
    
    if (!clientsMap.has(key)) {
      clientsMap.set(key, {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        totalSpent: order.total,
        orderCount: 1,
        lastOrderDate: order.createdAt
      });
    } else {
      const client = clientsMap.get(key)!;
      client.totalSpent += order.total;
      client.orderCount += 1;
      if (new Date(order.createdAt) > new Date(client.lastOrderDate)) {
        client.lastOrderDate = order.createdAt;
      }
    }
  });

  const clients = Array.from(clientsMap.values());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-foreground">Meus Clientes</h1>
          <p className="text-muted-foreground mt-1">CRM: Relacionamento e histórico de compras ({clients.length} clientes).</p>
        </div>
        <div className="flex bg-panel border border-border-subtle rounded-xl px-3 py-2 w-full sm:w-auto">
          <Search className="h-5 w-5 text-muted-foreground mr-2" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..." 
            className="bg-transparent border-none focus:outline-none text-foreground text-sm w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-panel border border-border-subtle rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-100/50 dark:bg-zinc-800/50 text-muted-foreground font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Pedidos</th>
                <th className="px-6 py-4">Total Gasto</th>
                <th className="px-6 py-4">Última Compra</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    Nenhum cliente comprou na sua loja ainda.
                  </td>
                </tr>
              ) : (
                clients.map((client, i) => (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-lg">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      {client.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" /> {client.email}</span>
                        <span className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" /> {client.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                        {client.orderCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-500">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.totalSpent)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(client.lastOrderDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-500 hover:text-blue-400 font-bold text-sm px-3 py-1 rounded border border-blue-500/20 bg-blue-500/10 transition-colors">
                        Enviar Oferta
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
