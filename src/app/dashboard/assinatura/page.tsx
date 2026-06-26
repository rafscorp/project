import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { ShieldCheck, Zap, AlertCircle, ArrowRight, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function AssinaturaPage() {
  const session = await getSession();
  if (!session || !session.storeId) redirect("/login");

  const store = await prisma.store.findUnique({
    where: { id: session.storeId },
    include: {
      subscription: {
        include: { plan: true }
      },
      offers: {
        where: { used: false, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
        take: 1
      },
      _count: {
        select: { products: { where: { deletedAt: null } } }
      }
    }
  });

  if (!store) redirect("/login");

  const currentPlan = store.subscription?.plan;
  const productsCount = store._count.products;
  const activeOffer = store.offers[0];
  const offerDaysLeft = activeOffer ? Math.ceil((activeOffer.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  const allPlans = await prisma.subscriptionPlan.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" }
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-display font-black text-foreground">Minha Assinatura</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seu plano atual, acompanhe seus limites e faça upgrade.
        </p>
      </div>

      {activeOffer && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-[0_0_40px_rgba(245,158,11,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0 border border-amber-500/40">
            <Zap className="w-8 h-8 text-amber-500" />
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-black text-amber-400 mb-1">Oferta Exclusiva Liberada!</h2>
            <p className="text-amber-500/80 font-medium">
              Você ganhou <strong className="text-amber-400">{activeOffer.discountPercentage}% de desconto</strong> na renovação ou upgrade.
            </p>
            <p className="text-xs font-bold text-amber-400/60 mt-2 uppercase tracking-wider">
              Expira em {offerDaysLeft} {offerDaysLeft === 1 ? "dia" : "dias"}
            </p>
          </div>
          
          <div className="shrink-0 w-full sm:w-auto">
            <Link href="/planos">
              <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                Aproveitar Desconto <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-panel border border-border-subtle rounded-3xl p-6 relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="w-32 h-32 text-violet-500" />
          </div>
          <h3 className="text-lg font-bold text-muted-foreground mb-4 relative z-10">Plano Atual</h3>
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-foreground mb-1">{currentPlan?.name || "Nenhum Plano"}</h2>
            <div className="text-2xl font-bold text-violet-400 mb-6">
              {currentPlan?.priceMonthly ? "R$ " + currentPlan.priceMonthly.toString().replace(".", ",") + "/mês" : "Gratuito"}
            </div>
            
            <div className="space-y-4">
              <div className="bg-background rounded-xl p-4 border border-border-subtle">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Package className="w-4 h-4 text-muted-foreground" /> Peças
                  </div>
                  <div className={"text-sm font-bold " + (productsCount >= (currentPlan?.maxProducts || 0) ? "text-red-400" : "text-emerald-400")}>
                    {productsCount} / {currentPlan?.maxProducts || "∞"}
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className={"h-2 rounded-full " + (productsCount >= (currentPlan?.maxProducts || 0) ? "bg-red-500" : "bg-emerald-500")} 
                    style={{ width: Math.min((productsCount / (currentPlan?.maxProducts || 1)) * 100, 100) + "%" }} 
                  />
                </div>
              </div>
            </div>

            <Link href="/planos">
              <Button className="w-full mt-6 bg-violet-600 hover:bg-violet-500 text-white font-bold">
                Mudar de Plano
              </Button>
            </Link>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-foreground">Planos Disponíveis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allPlans.map((plan) => {
              const isCurrent = plan.id === currentPlan?.id;
              const isFree = plan.priceMonthly === 0;
              const hasDiscount = activeOffer && !isFree;
              const discountedPrice = hasDiscount ? plan.priceMonthly * (1 - activeOffer.discountPercentage / 100) : plan.priceMonthly;
              
              return (
                <div 
                  key={plan.id} 
                  className={"rounded-2xl p-5 border transition-all duration-300 relative flex flex-col " + (
                    isCurrent 
                      ? "bg-violet-500/10 border-violet-500/50" 
                      : isFree 
                        ? "bg-zinc-900 border-zinc-800" 
                        : "bg-panel border-border-subtle hover:border-violet-500/30"
                  )}
                >
                  {isCurrent && (
                    <div className="absolute top-0 right-4 -translate-y-1/2 bg-violet-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                      Seu Plano
                    </div>
                  )}
                  
                  <h4 className={"text-lg font-black " + (isFree ? "text-zinc-400" : "text-foreground")}>{plan.name}</h4>
                  
                  <div className="mt-2 mb-4">
                    {hasDiscount && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm line-through text-muted-foreground">R$ {plan.priceMonthly.toString().replace(".", ",")}</span>
                        <span className="text-[10px] font-black bg-amber-400 text-black px-1.5 py-0.5 rounded">-{activeOffer.discountPercentage}%</span>
                      </div>
                    )}
                    <div className={"text-3xl font-black " + (isFree ? "text-zinc-500" : "text-foreground")}>
                      <span className="text-lg text-muted-foreground mr-1">R$</span>
                      {discountedPrice.toFixed(2).replace(".", ",")}
                      <span className="text-sm font-medium text-muted-foreground ml-1">/mês</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    <li className="flex items-center text-sm font-medium text-muted-foreground">
                      <Package className="w-4 h-4 mr-2 text-zinc-500" /> Até {plan.maxProducts} peças
                    </li>
                    <li className="flex items-center text-sm font-medium text-muted-foreground">
                      <Users className="w-4 h-4 mr-2 text-zinc-500" /> {plan.maxStaff} usuários
                    </li>
                  </ul>

                  {!isCurrent && (
                    <Link href={"/loja/painel/assinatura?planId=" + plan.id}>
                      <Button variant={isFree ? "outline" : "default"} className={"w-full font-bold " + (!isFree ? "bg-violet-600 hover:bg-violet-500 text-white" : "")}>
                        {isFree ? "Fazer Downgrade" : "Assinar Plano"}
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
