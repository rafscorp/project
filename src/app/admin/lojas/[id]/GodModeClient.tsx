"use client";
import { useState } from "react";
import { ShieldAlert, Zap, ArrowLeft, Package, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function GodModeClient({ store }: { store: any }) {
  const [discount, setDiscount] = useState("30");
  const [days, setDays] = useState("7");
  const [loading, setLoading] = useState(false);

  const handleSendOffer = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: store.id, discount: Number(discount), validDays: Number(days) })
      });
      if (res.ok) {
        alert("Oferta enviada e vinculada com sucesso!");
        window.location.reload();
      } else {
        alert("Erro ao enviar oferta");
      }
    } catch {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/lojas">
          <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-black text-foreground flex items-center gap-2">
            Modo Deus <ShieldAlert className="w-6 h-6 text-red-500" />
          </h1>
          <p className="text-muted-foreground">Visão detalhada e controle total sobre a loja.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-panel border border-border-subtle rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><User className="w-5 h-5 text-violet-400" /> Dados da Loja</h2>
          <div className="space-y-3 text-sm">
            <p><span className="text-muted-foreground">Loja:</span> <strong className="text-foreground">{store.name}</strong></p>
            <p><span className="text-muted-foreground">Slug:</span> <span className="text-foreground">/{store.slug}</span></p>
            <p><span className="text-muted-foreground">Dono:</span> <strong className="text-foreground">{store.owner.name}</strong></p>
            <p><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{store.owner.email}</span></p>
            <p><span className="text-muted-foreground">Telefone:</span> <span className="text-foreground">{store.phone}</span></p>
          </div>
        </div>

        <div className="bg-panel border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Package className="w-24 h-24 text-emerald-500" /></div>
          <h2 className="text-xl font-bold mb-4 relative z-10">Plano & Limites</h2>
          <div className="space-y-4 relative z-10">
            <div>
              <p className="text-sm text-muted-foreground">Plano Atual</p>
              <p className="text-2xl font-black text-foreground">{store.subscription?.plan?.name || "Nenhum"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Uso de Peças</p>
              <div className="flex items-center gap-2">
                <span className={"text-xl font-bold " + (store._count.products >= (store.subscription?.plan?.maxProducts || 0) ? "text-red-400" : "text-emerald-400")}>
                  {store._count.products} / {store.subscription?.plan?.maxProducts || "∞"}
                </span>
                {store._count.products >= (store.subscription?.plan?.maxProducts || 0) && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">LIMITE EXCEDIDO</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-500"><Zap className="w-5 h-5" /> Enviar Oferta Promocional</h2>
          <p className="text-sm text-amber-500/80 mb-6">
            Envie um desconto exclusivo para este cliente renovar ou fazer upgrade. O sistema enviará um email e vinculará a oferta na conta dele.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-amber-400 mb-1">Desconto (%)</label>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white" />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-amber-400 mb-1">Validade (Dias)</label>
              <input type="number" value={days} onChange={e => setDays(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white" />
            </div>
            <Button onClick={handleSendOffer} loading={loading} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black font-bold h-[42px]">
              Gerar e Enviar Oferta
            </Button>
          </div>

          {store.offers.length > 0 && (
            <div className="mt-6 pt-6 border-t border-amber-500/20">
              <h3 className="text-sm font-bold text-amber-400 mb-3">Histórico de Ofertas</h3>
              <div className="space-y-2">
                {store.offers.map((offer: any) => (
                  <div key={offer.id} className="bg-black/20 rounded-lg p-3 text-sm flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white">{offer.discountPercentage}% OFF</span>
                      <span className="text-muted-foreground ml-2">Expira: {new Date(offer.expiresAt).toLocaleDateString()}</span>
                    </div>
                    <span className={"text-xs font-bold px-2 py-1 rounded " + (offer.used ? "bg-emerald-500/20 text-emerald-400" : (new Date(offer.expiresAt) < new Date() ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"))}>
                      {offer.used ? "Usado" : (new Date(offer.expiresAt) < new Date() ? "Expirou" : "Ativo")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
