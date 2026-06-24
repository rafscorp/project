import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { Stats } from "@/components/ui/Stats";
import { ShoppingBag, Star, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/format";

export default async function ContaDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [ordersCount, unreadNotifications, recentOrders] = await Promise.all([
    prisma.order.count({ where: { customerId: session.userId } }),
    prisma.notification.count({ where: { userId: session.userId, read: false } }),
    prisma.order.findMany({
      where: { customerId: session.userId },
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { store: { select: { name: true } } }
    })
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Olá, {session.name.split(" ")[0]}!</h1>
        <p className="text-zinc-400">Bem-vindo ao seu painel de controle.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stats 
          label="Meus Pedidos" 
          value={ordersCount} 
          icon={ShoppingBag} 
        />
        <Stats 
          label="Notificações" 
          value={unreadNotifications} 
          icon={Bell} 
        />
        <Stats 
          label="Lojas Favoritas" 
          value={0} 
          icon={Star} 
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 mt-8">
          <h2 className="font-display text-lg font-bold text-white">Últimos Pedidos</h2>
          <Link href="/conta/pedidos">
            <Button variant="ghost" size="sm">Ver todos</Button>
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center">
            <p className="text-zinc-500">Você ainda não fez nenhum pedido.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
                <div>
                  <p className="font-medium text-white">{order.store.name}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")} • {order.orderNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">{formatCurrency(order.total)}</p>
                  <p className="text-xs text-amber-400">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
