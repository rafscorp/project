import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowLeft, Store, Calendar, MapPin, Package, ShoppingBag } from "lucide-react";

export default async function CustomerOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { customerId: session.userId },
    include: {
      store: {
        select: {
          name: true,
          address: true,
          city: true,
          state: true,
        }
      },
      items: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col">
      <div className="fixed inset-0 z-0 bg-mesh-dark pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-grid-dark opacity-30 pointer-events-none" />
      
      {/* Header Minimalista */}
      <header className="relative z-10 h-20 border-b border-border-subtle bg-background/80 backdrop-blur-xl flex items-center px-4 sm:px-8 sticky top-0">
        <Link href="/cliente/home" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mr-8">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium hidden sm:inline">Voltar</span>
        </Link>
        <h1 className="text-xl font-bold font-display text-foreground">Histórico de Compras</h1>
      </header>

      <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 border border-border-subtle">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Nenhum pedido encontrado</h2>
            <p className="text-muted-foreground max-w-md mb-8">Você ainda não realizou nenhuma compra através da plataforma. Encontre as melhores oficinas e autopeças perto de você.</p>
            <Link href="/lojas" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-full transition-colors">
              Explorar Oficinas
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="glass-panel border border-border-subtle bg-panel/60 rounded-3xl overflow-hidden hover:border-zinc-500/50 transition-colors">
                {/* Header do Pedido */}
                <div className="border-b border-border-subtle bg-zinc-900/30 px-6 py-4 flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">PEDIDO Nº</p>
                    <p className="text-foreground font-mono">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">DATA DA COMPRA</p>
                    <p className="text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-zinc-500" />
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">TOTAL</p>
                    <p className="text-emerald-400 font-bold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm font-bold text-muted-foreground mb-1">CÓDIGO DE RETIRADA</p>
                    <span className="px-3 py-1 bg-violet-500/20 text-violet-400 font-mono font-bold rounded-lg border border-violet-500/30">
                      {order.pickupCode}
                    </span>
                  </div>
                </div>

                {/* Corpo do Pedido */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-subtle">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-border-subtle flex items-center justify-center shrink-0">
                      <Store className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{order.store.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {order.store.city}, {order.store.state}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-muted-foreground uppercase flex items-center gap-2">
                      <Package className="h-4 w-4" /> Itens Adquiridos
                    </h4>
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-zinc-300"><span className="text-zinc-500 mr-2">{item.quantity}x</span> {item.productName}</span>
                        <span className="text-muted-foreground">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 flex justify-end gap-3">
                    <button className="px-4 py-2 text-sm font-bold bg-zinc-800 hover:bg-zinc-700 text-foreground rounded-lg transition-colors border border-border-subtle">
                      Baixar Recibo
                    </button>
                    {order.status === 'COMPLETED' && (
                      <button className="px-4 py-2 text-sm font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors border border-blue-500/30">
                        Avaliar Loja
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
