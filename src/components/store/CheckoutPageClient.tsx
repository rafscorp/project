"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StoreHeader } from "@/components/store/StoreHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils/format";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, Package, CalendarCheck, MapPin, Copy, ArrowLeft } from "lucide-react";

export function CheckoutPageClient({
  store,
}: {
  store: { slug: string; name: string; city: string; state: string; phone: string; address: string };
}) {
  const router = useRouter();
  const { items, total, count, clear, loaded } = useCart(store.slug);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<{ orderNumber: string; pickupCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
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

  function copyCode() {
    if (!order) return;
    navigator.clipboard.writeText(order.pickupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // SUCCESS SCREEN
  if (order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed inset-0 z-0 bg-grid-dark opacity-20 pointer-events-none" />
        <StoreHeader store={store} />
        <main className="relative z-10 mx-auto max-w-lg px-4 py-16 sm:px-6">
          <div className="glass-panel rounded-[2rem] border border-emerald-500/20 bg-panel/60 p-10 text-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
            <h1 className="font-display text-3xl font-black text-foreground mb-2">Agendamento Confirmado!</h1>
            <p className="text-muted-foreground mb-2">Pedido <strong className="text-foreground font-mono">{order.orderNumber}</strong></p>
            <p className="text-muted-foreground text-sm mb-8">A loja foi notificada e entrará em contato para confirmar a disponibilidade.</p>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-8">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Seu Código de Retirada</p>
              <p className="font-display text-5xl font-black tracking-[0.3em] text-amber-400 mb-4">{order.pickupCode}</p>
              <button
                onClick={copyCode}
                className="flex items-center gap-2 mx-auto text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-panel/50 px-4 py-2 rounded-xl border border-border-subtle"
              >
                <Copy className="h-4 w-4" /> {copied ? 'Copiado!' : 'Copiar código'}
              </button>
            </div>

            <div className="flex items-start gap-3 bg-background/50 rounded-2xl p-4 border border-border-subtle text-left mb-8">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-foreground">{store.name}</p>
                <p className="text-xs text-muted-foreground">{store.address} — {store.city}/{store.state}</p>
                <p className="text-xs text-muted-foreground mt-1">Tel: {store.phone}</p>
              </div>
            </div>

            <Button
              className="w-full h-12 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl"
              onClick={() => router.push(`/loja/${store.slug}`)}
            >
              Voltar à Loja
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // CHECKOUT FORM
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 z-0 bg-grid-dark opacity-20 pointer-events-none" />
      <StoreHeader store={store} />
      <main className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-4 mb-10">
          <Link href={`/loja/${store.slug}/carrinho`} className="p-2 rounded-xl bg-panel border border-border-subtle text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-3xl font-black text-foreground">Finalizar Agendamento</h1>
            <p className="text-muted-foreground text-sm mt-1">Confirme seus dados e reserve as peças em {store.name}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="glass-panel rounded-[2rem] border border-border-subtle bg-panel/40 overflow-hidden">
              <div className="p-6 border-b border-border-subtle">
                <h2 className="font-bold text-foreground text-lg">Seus Dados de Contato</h2>
                <p className="text-sm text-muted-foreground mt-1">Para a loja entrar em contato sobre sua reserva</p>
              </div>
              <form id="checkout-form" onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400 font-medium">
                    {error}
                  </div>
                )}
                <Input
                  label="Nome Completo *"
                  placeholder="João Silva"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  required
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="E-mail *"
                    type="email"
                    placeholder="joao@email.com"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    required
                  />
                  <Input
                    label="WhatsApp *"
                    placeholder="(11) 99999-9999"
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground/80 mb-2">Observações (Opcional)</label>
                  <textarea
                    className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all resize-none"
                    rows={3}
                    placeholder="Informações adicionais para a loja..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="glass-panel rounded-[2rem] border border-border-subtle bg-panel/40 overflow-hidden sticky top-24">
              <div className="p-6 border-b border-border-subtle">
                <h2 className="font-bold text-foreground text-lg">Resumo do Pedido</h2>
              </div>
              <ul className="divide-y divide-border-subtle max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 rounded-lg bg-panel border border-border-subtle flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity}x {formatCurrency(item.price)}</p>
                    </div>
                    <span className="text-sm font-bold text-foreground shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="p-6 border-t border-border-subtle space-y-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({count} itens)</span>
                  <span className="text-foreground font-medium">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Frete</span>
                  <span className="text-emerald-400 font-bold">Retirada Grátis</span>
                </div>
                <div className="border-t border-border-subtle pt-4 flex justify-between text-xl font-black">
                  <span className="text-foreground">Total</span>
                  <span className="text-amber-400">{formatCurrency(total)}</span>
                </div>
                <Button
                  type="submit"
                  form="checkout-form"
                  loading={loading}
                  className="w-full h-14 bg-amber-500 hover:bg-amber-400 text-black font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] border-none"
                >
                  <CalendarCheck className="h-5 w-5 mr-2" /> Confirmar Pedido
                </Button>
                <p className="text-center text-xs text-zinc-600">Pagamento combinado diretamente com a loja na retirada.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
