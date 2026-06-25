"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreHeader } from "@/components/store/StoreHeader";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils/format";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CalendarCheck, Package } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export function CartPageClient({
  store,
}: {
  store: { slug: string; name: string; city: string; state: string; phone: string; address: string };
}) {
  const router = useRouter();
  const { items, updateQty, removeItem, total, count, loaded } = useCart(store.slug);

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="fixed inset-0 z-0 bg-grid-dark opacity-20 pointer-events-none" />
      <StoreHeader store={store} />
      <main className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-4 mb-10">
          <Link href={`/loja/${store.slug}`} className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-3xl font-black text-white">Minha Agenda de Peças</h1>
            <p className="text-zinc-400 text-sm mt-1">{count > 0 ? `${count} ${count === 1 ? 'item' : 'itens'} para reservar em ${store.name}` : `Nada agendado ainda em ${store.name}`}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="glass-panel p-16 rounded-[2rem] border border-white/5 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6">
              <ShoppingBag className="h-10 w-10 text-zinc-600" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Sua agenda está vazia</h2>
            <p className="text-zinc-400 mb-8 max-w-sm">Navegue pela vitrine e reserve as peças que você precisa para retirar na loja.</p>
            <Link href={`/loja/${store.slug}`}>
              <Button className="bg-amber-500 hover:bg-amber-400 text-black font-black h-12 px-8 text-base">
                <Package className="h-5 w-5 mr-2" /> Ver Peças da Loja
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Lista de Itens */}
            <div className="lg:col-span-3">
              <div className="glass-panel rounded-[2rem] border border-white/5 bg-zinc-900/40 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <h2 className="font-bold text-white text-lg">Itens Reservados</h2>
                </div>
                <ul className="divide-y divide-white/5">
                  {items.map((item) => (
                    <li key={item.productId} className="flex items-center gap-4 p-6 hover:bg-zinc-800/30 transition-colors">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                        <Package className="h-6 w-6 text-zinc-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate">{item.name}</p>
                        <p className="text-sm text-amber-400 font-medium mt-0.5">{formatCurrency(item.price)} / un</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-black text-white text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors flex items-center justify-center disabled:opacity-30"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="w-24 text-right font-black text-white shrink-0">{formatCurrency(item.price * item.quantity)}</p>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Resumo */}
            <div className="lg:col-span-2">
              <div className="glass-panel rounded-[2rem] border border-white/5 bg-zinc-900/40 p-8 sticky top-24">
                <h2 className="font-black text-white text-xl mb-6">Resumo do Pedido</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal ({count} itens)</span>
                    <span className="text-white font-medium">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Taxa de entrega</span>
                    <span className="text-emerald-400 font-bold">Grátis</span>
                  </div>
                  <div className="border-t border-white/10 pt-4 flex justify-between text-xl font-black">
                    <span className="text-white">Total</span>
                    <span className="text-amber-400">{formatCurrency(total)}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-zinc-500 bg-zinc-950/50 rounded-2xl p-4 border border-white/5 mb-6">
                  <p className="flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-emerald-500" /> Retirada na loja — sem frete</p>
                  <p className="text-zinc-600 text-xs">Endereço: {store.address}, {store.city}/{store.state}</p>
                </div>
                <Button
                  className="w-full h-14 bg-amber-500 hover:bg-amber-400 text-black font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] border-none"
                  onClick={() => router.push(`/loja/${store.slug}/checkout`)}
                >
                  <CalendarCheck className="h-5 w-5 mr-2" /> Confirmar Agendamento
                </Button>
                <Link href={`/loja/${store.slug}`} className="block text-center text-sm text-zinc-500 hover:text-zinc-300 transition-colors mt-4">
                  ← Continuar vendo peças
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
