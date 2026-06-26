import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { StoreService } from "@/services/store.service";
import { Check, AlertTriangle, ShieldCheck, QrCode, Copy, Zap } from "lucide-react";
import { PixCheckoutClient } from "./PixCheckoutClient";

export default async function PaymentPage() {
  const session = await getSession();
  if (!session || !session.storeId) redirect("/login");

  const store = await StoreService.getById(session.storeId);
  if (!store) redirect("/login");

  const fomoStatus = StoreService.getFomoStatus(store);
  const plans = await prisma.subscriptionPlan.findMany({
    where: { active: true },
    orderBy: { priceMonthly: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8">

      {/* ── Alertas de status ───────────────────────────────────────────────── */}
      {fomoStatus === "HARD_LOCK" && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold mb-1">Sua loja está suspensa</h2>
            <p className="text-sm">
              Seu período de carência acabou. Clientes não podem mais ver sua loja nem mandar mensagens.
              Assine agora via PIX e volte ao ar em segundos.
            </p>
          </div>
        </div>
      )}

      {fomoStatus === "SOFT_LOCK" && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-6 rounded-2xl flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold mb-1">Período de Teste Expirando</h2>
            <p className="text-sm">
              Sua loja ainda está no ar, mas você precisa ativar uma assinatura antes do bloqueio.
              Garantia de 7 dias — risco zero.
            </p>
          </div>
        </div>
      )}

      {/* ── Cabeçalho ──────────────────────────────────────────────────────── */}
      <div className="text-center mb-4">
        <h1 className="text-4xl font-display font-black text-foreground mb-4">Escolha seu Plano</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Ative sua máquina de vendas. Você tem{" "}
          <strong className="text-emerald-400">7 dias de Teste Grátis</strong> amparado por lei.
          Se cancelar antes, não cobraremos 1 centavo.
        </p>
      </div>

      {/* ── Banner legal PROCON ─────────────────────────────────────────────── */}
      <div className="bg-panel/40 border border-emerald-500/20 p-5 rounded-3xl flex items-start sm:items-center gap-4">
        <ShieldCheck className="w-10 h-10 text-emerald-500 shrink-0" />
        <div>
          <h3 className="text-emerald-400 font-bold mb-1">Risco Zero — Art. 49 do CDC</h3>
          <p className="text-muted-foreground text-sm">
            Você tem <strong>7 dias</strong> de teste totalmente gratuito. O valor só é cobrado
            caso continue após o oitavo dia. Após o pagamento, não há estorno.
          </p>
        </div>
      </div>

      {/* ── Grade de planos ─────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="glass-panel p-8 rounded-3xl border border-border-subtle bg-panel/50 flex flex-col relative overflow-hidden"
          >
            {plan.priceMonthly > 50 && (
              <div className="absolute top-0 right-0 bg-violet-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl z-10">
                MAIS POPULAR
              </div>
            )}

            <h3 className="text-3xl font-black text-foreground mb-2">{plan.name}</h3>
            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-4xl font-black text-violet-400">
                R$ {plan.priceMonthly.toFixed(2)}
              </span>
              <span className="text-muted-foreground font-medium">/mês</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {(plan.features as string[])?.map((feature, i) => (
                <li key={i} className="flex items-start text-foreground/80">
                  <Check className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
                  <span className="font-medium text-sm">{feature}</span>
                </li>
              ))}
              <li className="flex items-start text-foreground/80">
                <Check className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
                <span className="font-medium text-sm">7 Dias de Teste Grátis Inclusos</span>
              </li>
            </ul>

            {/* PIX Checkout (Client Component) */}
            <div className="pt-6 border-t border-border-subtle mt-auto">
              <PixCheckoutClient planId={plan.id} price={plan.priceMonthly} planName={plan.name} />
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-2 text-center text-muted-foreground p-12 glass-panel rounded-3xl">
            Nenhum plano configurado no sistema ainda.
          </div>
        )}
      </div>

      {/* ── Rodapé de segurança ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-6 flex-wrap pt-4 text-xs text-zinc-600">
        <span className="flex items-center gap-1.5">
          <QrCode className="w-4 h-4" /> Pagamento 100% via PIX
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="w-4 h-4" /> Aprovação instantânea
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Processado pelo Mercado Pago
        </span>
      </div>
    </div>
  );
}
