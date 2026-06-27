import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { Ticket, Plus, Tag, Clock } from "lucide-react";

export default async function StoreCouponsPage() {
  const session = await getSession();
  if (!session || !session.storeId) redirect("/login");

  const coupons = await prisma.coupon.findMany({
    where: { storeId: session.storeId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-foreground">Cupons de Desconto</h1>
          <p className="text-muted-foreground mt-1">Crie ofertas especiais para atrair mais clientes para sua loja.</p>
        </div>
        <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          <Plus className="h-5 w-5" />
          Novo Cupom
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.length === 0 ? (
          <div className="col-span-full bg-panel border border-border-subtle rounded-3xl p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-violet-500/10 text-violet-500 rounded-full flex items-center justify-center mb-4 border border-violet-500/20">
              <Ticket className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhum cupom ativo</h3>
            <p className="text-muted-foreground max-w-md">Cupons são uma ótima forma de fidelizar clientes. Crie um desconto de primeira compra para se destacar.</p>
          </div>
        ) : (
          coupons.map(coupon => (
            <div key={coupon.id} className="bg-panel border border-border-subtle rounded-2xl overflow-hidden hover:border-violet-500/50 transition-colors group">
              <div className="bg-violet-500/10 px-6 py-4 flex justify-between items-center border-b border-border-subtle">
                <span className="font-mono font-bold text-violet-400 text-lg flex items-center gap-2">
                  <Tag className="h-4 w-4" /> {coupon.code}
                </span>
                <span className={`px-2 py-1 text-xs font-bold rounded ${coupon.active ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
                  {coupon.active ? "ATIVO" : "INATIVO"}
                </span>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-foreground font-medium">{coupon.description || "Sem descrição"}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Desconto:</span>
                  <span className="font-bold text-emerald-400 text-lg">
                    {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `R$ ${coupon.value}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usos:</span>
                  <span className="text-foreground font-medium">
                    {coupon.usedCount} / {coupon.maxUses || "∞"}
                  </span>
                </div>
                {coupon.expiresAt && (
                  <div className="flex items-center gap-2 text-sm text-amber-500/80 mt-4 pt-4 border-t border-border-subtle">
                    <Clock className="h-4 w-4" /> Vence em: {new Date(coupon.expiresAt).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
