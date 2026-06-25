import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { StoreService } from "@/services/store.service";
import { CreditCard, QrCode, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function PaymentPage() {
  const session = await getSession();
  if (!session || !session.storeId) redirect("/login");

  const store = await StoreService.getById(session.storeId);
  if (!store) redirect("/login");

  const fomoStatus = StoreService.getFomoStatus(store);
  const plans = await prisma.subscriptionPlan.findMany({
    where: { active: true },
    orderBy: { priceMonthly: "asc" }
  });

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      {fomoStatus === "HARD_LOCK" && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold mb-1">Sua loja está suspensa</h2>
            <p className="text-sm">Seu período de carência acabou. Clientes não podem mais ver sua loja nem mandar mensagens. Renove agora para voltar ao ar imediatamente.</p>
          </div>
        </div>
      )}

      {fomoStatus === "SOFT_LOCK" && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-6 rounded-2xl flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold mb-1">Assinatura Expirada</h2>
            <p className="text-sm">Sua loja ainda está no ar e recebendo orçamentos, mas você não pode responder os clientes. Renove antes que o bloqueio total aconteça.</p>
          </div>
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-3xl font-display font-black text-white">Renovação de Plano</h1>
        <p className="text-zinc-400 mt-2">Escolha seu plano e ative sua máquina de vendas novamente.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {plans.map(plan => (
          <div key={plan.id} className="glass-panel p-8 rounded-3xl border border-white/10 bg-zinc-900/50 flex flex-col">
            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-black text-violet-400">R$ {plan.priceMonthly.toFixed(2)}</span>
              <span className="text-zinc-500">/mês</span>
            </div>
            
            <ul className="space-y-3 mb-8 flex-1">
              {(plan.features as string[])?.map((feature, i) => (
                <li key={i} className="flex items-center text-zinc-300 text-sm">
                  <Check className="w-4 h-4 text-emerald-500 mr-3 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="space-y-3 mt-auto">
              <form action="/api/checkout/stripe" method="POST">
                <input type="hidden" name="planId" value={plan.id} />
                <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold h-12">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pagar com Cartão (Stripe)
                </Button>
              </form>
              
              <form action="/api/checkout/mercadopago" method="POST">
                <input type="hidden" name="planId" value={plan.id} />
                <Button type="submit" className="w-full bg-[#009EE3] hover:bg-[#008DD0] text-white font-bold h-12">
                  <QrCode className="w-5 h-5 mr-2" />
                  Pagar com Pix (Mercado Pago)
                </Button>
              </form>
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-2 text-center text-zinc-500 p-12">
            Nenhum plano configurado no sistema ainda.
          </div>
        )}
      </div>
    </div>
  );
}
