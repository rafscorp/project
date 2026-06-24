"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StoreHeader } from "@/components/store/StoreHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils/format";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2 } from "lucide-react";

export function CheckoutPageClient({
  store,
}: {
  store: { slug: string; name: string; city: string; state: string; phone: string; address: string };
}) {
  const router = useRouter();
  const { items, total, clear, loaded } = useCart(store.slug);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<{ orderNumber: string; pickupCode: string } | null>(null);
  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", notes: "" });

  if (!loaded) return null;

  if (items.length === 0 && !order) {
    router.replace(`/loja/${store.slug}/carrinho`);
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeSlug: store.slug,
        ...form,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      setError(json.error);
      return;
    }

    clear();
    setOrder({ orderNumber: json.data.orderNumber, pickupCode: json.data.pickupCode });
  }

  if (order) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <StoreHeader store={store} />
        <main className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
          <h1 className="mt-4 font-display text-2xl font-bold text-white">Pedido realizado!</h1>
          <p className="mt-2 text-zinc-400">Número: <strong className="text-white">{order.orderNumber}</strong></p>
          <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6">
            <p className="text-sm text-zinc-400">Código de retirada na loja</p>
            <p className="font-display text-4xl font-bold tracking-widest text-amber-400">{order.pickupCode}</p>
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            Apresente este código em {store.address}, {store.city}/{store.state}
          </p>
          <Button className="mt-8" onClick={() => router.push(`/loja/${store.slug}`)}>Voltar à loja</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <StoreHeader store={store} />
      <main className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-white">Finalizar pedido</h1>
        <p className="mt-1 text-sm text-zinc-400">Retirada na loja — pagamento combinado com a loja</p>

        {error && <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Nome" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
          <Input label="E-mail" type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} required />
          <Input label="Telefone / WhatsApp" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} required />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Observações</label>
            <textarea
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-white"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="rounded-xl bg-zinc-800/50 p-4">
            <p className="flex justify-between font-bold text-white">
              <span>Total ({items.length} itens)</span>
              <span className="text-amber-400">{formatCurrency(total)}</span>
            </p>
          </div>
          <Button type="submit" size="lg" className="w-full" loading={loading}>Confirmar pedido</Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
