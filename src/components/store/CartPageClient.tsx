"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreHeader } from "@/components/store/StoreHeader";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils/format";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export function CartPageClient({
  store,
}: {
  store: { slug: string; name: string; city: string; state: string; phone: string; address: string };
}) {
  const router = useRouter();
  const { items, updateQty, removeItem, total, loaded } = useCart(store.slug);

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-zinc-950">
      <StoreHeader store={store} />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-white">Carrinho</h1>

        {items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-zinc-800 p-12 text-center">
            <p className="text-zinc-500">Seu carrinho está vazio</p>
            <Link href={`/loja/${store.slug}`} className="mt-4 inline-block">
              <Button>Continuar comprando</Button>
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-6 space-y-4">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-sm text-amber-400">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="rounded-lg bg-zinc-800 p-1.5 text-zinc-400 hover:text-white">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="rounded-lg bg-zinc-800 p-1.5 text-zinc-400 hover:text-white">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="w-24 text-right font-semibold text-white">{formatCurrency(item.price * item.quantity)}</p>
                  <button onClick={() => removeItem(item.productId)} className="text-zinc-500 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex justify-between text-lg font-bold text-white">
                <span>Total</span>
                <span className="text-amber-400">{formatCurrency(total)}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">Retirada na loja — sem taxa de entrega</p>
              <Button className="mt-4 w-full" size="lg" onClick={() => router.push(`/loja/${store.slug}/checkout`)}>
                Finalizar pedido
              </Button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
