import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { Store, ArrowRight, CheckCircle2, ChevronLeft, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { BackButton } from "@/components/BackButton";

export const dynamic = 'force-dynamic';

export default async function PlanosPage() {
  const session = await getSession();

  const plans = await prisma.subscriptionPlan.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' }
  });

  const placaPlans = await prisma.placaQueryPlan.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' }
  });

  let activeOffer = null;
  if (session?.storeId) {
    const store = await prisma.store.findUnique({
      where: { id: session.storeId },
      include: {
        offers: {
          where: { used: false, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    if (store?.offers.length) {
      activeOffer = store.offers[0];
    }
  }

  const subscriptionsCount = await prisma.subscription.groupBy({
    by: ['planId'],
    _count: { planId: true },
    orderBy: { _count: { planId: 'desc' } },
    where: { status: 'ACTIVE' },
    take: 1,
  });

  const mostChosenPlanId = subscriptionsCount.length > 0 && subscriptionsCount[0]._count.planId > 0 
    ? subscriptionsCount[0].planId 
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      {/* BACKGROUND GLOBAL */}
      <div className="fixed inset-0 z-0 bg-mesh-dark pointer-events-none hidden sm:block" />
      <div className="fixed inset-0 z-0 bg-grid-dark opacity-40 pointer-events-none hidden sm:block" />
      
      <BackButton />

      <div className="max-w-7xl mx-auto w-full relative z-10">

        <div className="text-center mb-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-5 py-2 text-sm font-bold text-emerald-500">
            <Store className="h-4 w-4" /> Para Oficinas e Autopeças
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            Planos desenhados para acelerar.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-foreground/80 font-medium">
            Escolha o motor ideal para escalar o seu negócio. Nossos planos puxam da base de dados sem intermediários.
          </p>
          {activeOffer && (
            <div className="mt-8 bg-amber-500/20 border border-amber-500/40 rounded-xl p-4 inline-block shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <span className="font-black text-amber-500 text-lg">Você tem {activeOffer.discountPercentage}% de desconto ativo!</span>
              <p className="text-amber-500/80 text-sm font-medium mt-1">Os preços abaixo já refletem o seu desconto exclusivo.</p>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto items-center">
          {plans.map((plan, index) => {
            const isHighlight = index === 1; // Destaca o do meio
            const isFree = plan.priceMonthly === 0;
            
            const featuresArray = Array.isArray(plan.features) 
              ? plan.features 
              : typeof plan.features === 'string' 
                ? JSON.parse(plan.features) 
                : [];

            // Apply discount if active
            const hasDiscount = activeOffer && !isFree;
            const discountedPrice = hasDiscount ? plan.priceMonthly * (1 - activeOffer.discountPercentage / 100) : plan.priceMonthly;

            // Define the auth action link
            const subscribeLink = session 
                ? `/loja/painel/assinatura?planId=${plan.id}` 
                : `/login?callbackUrl=/planos&planId=${plan.id}`;

            return (
              <div key={plan.id} className="h-full">
                <Link href={subscribeLink} className="block group h-full outline-none">
                  {isHighlight ? (
                    // CARD DESTAQUE (Pago - Subtle Green/Blue)
                    <div className="relative glass-panel bg-panel/80 rounded-[2.5rem] p-10 h-[105%] -my-4 border-2 border-emerald-500/40 shadow-[0_0_60px_rgba(16,185,129,0.1)] flex flex-col hover:-translate-y-2 transition-transform duration-300">
                      <div className="absolute inset-0 bg-gradient-to-b from-emerald-600/5 to-transparent rounded-[2.5rem] pointer-events-none" />
                      
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-600/90 text-zinc-50 text-sm font-black px-6 py-2 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-500/50">
                        RECOMENDADO
                      </div>
                      
                      <div className="relative z-10 flex-1 flex flex-col">
                        <h3 className="text-2xl font-black text-emerald-400 group-hover:text-emerald-300">{plan.name}</h3>
                        <div className="mt-4 flex flex-col">
                          {(plan.comparePriceMonthly || hasDiscount) && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg font-bold text-muted-foreground line-through">
                                R$ {plan.priceMonthly.toString().replace('.', ',')}
                              </span>
                              <span className="text-xs font-black text-black bg-amber-400 px-2 py-0.5 rounded-md shadow-sm">
                                -{hasDiscount ? activeOffer.discountPercentage : Math.round((((plan.comparePriceMonthly || 0) - plan.priceMonthly) / (plan.comparePriceMonthly || 1)) * 100)}%
                              </span>
                            </div>
                          )}
                          <div className="flex items-baseline text-5xl font-black text-foreground">
                            <span className="text-2xl text-muted-foreground mr-1">R$</span>
                            {discountedPrice.toFixed(2).replace('.', ',')}
                            <span className="ml-2 text-xl font-bold text-muted-foreground">/mês</span>
                          </div>
                        </div>
                        <p className="mt-4 text-foreground/80 font-medium">{plan.description}</p>
                        <ul className="mt-8 space-y-4 mb-8 flex-1">
                          {featuresArray.map((feat: string) => (
                            <li key={feat} className="flex items-center text-foreground font-medium text-lg">
                              <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mr-3" />
                              <span className="text-foreground/80 font-medium">{feat}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="w-full mt-auto flex items-center justify-center h-16 bg-emerald-600/90 border border-emerald-500/50 text-zinc-50 font-black text-xl rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:bg-emerald-500 transition-all btn-shimmer">
                          <span className="relative z-20">Assinar {plan.name} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform inline" /></span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // CARD NORMAL (Free = dark gray, Paid = subtle blue/green)
                    <div className={`relative rounded-3xl p-8 h-full border transition-colors flex flex-col hover:-translate-y-2 duration-300 ${
                      isFree 
                        ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50' 
                        : 'bg-panel border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-950/20 shadow-[0_0_30px_rgba(6,182,212,0.05)]'
                    }`}>
                      {mostChosenPlanId === plan.id && !isFree && (
                        <div className="absolute top-0 right-8 bg-cyan-600/80 border border-cyan-500/50 text-zinc-50 text-xs font-black px-4 py-1.5 rounded-b-xl shadow-lg transform origin-top">
                          MAIS ESCOLHIDO
                        </div>
                      )}
                      <h3 className={`text-2xl font-black mt-2 ${isFree ? 'text-zinc-400' : 'text-cyan-400'}`}>{plan.name}</h3>
                      <div className="mt-4 flex flex-col">
                        {(plan.comparePriceMonthly || hasDiscount) && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-muted-foreground line-through">
                              R$ {plan.priceMonthly.toString().replace('.', ',')}
                            </span>
                            <span className="text-xs font-black text-black bg-amber-400 px-2 py-0.5 rounded-md shadow-sm">
                              -{hasDiscount ? activeOffer.discountPercentage : Math.round((((plan.comparePriceMonthly || 0) - plan.priceMonthly) / (plan.comparePriceMonthly || 1)) * 100)}%
                            </span>
                          </div>
                        )}
                        <div className={`flex items-baseline text-5xl font-extrabold ${isFree ? 'text-zinc-300' : 'text-foreground'}`}>
                          <span className="text-2xl text-muted-foreground mr-1">R$</span>
                          {discountedPrice.toFixed(2).replace('.', ',')}
                          <span className="ml-2 text-xl font-medium text-muted-foreground">/mês</span>
                        </div>
                      </div>
                      <p className="mt-4 text-foreground/80 font-medium">{plan.description}</p>
                      <ul className="mt-8 space-y-4 mb-8 flex-1">
                        {featuresArray.map((feature: string) => (
                          <li key={feature} className="flex items-center text-foreground/80 font-medium text-lg">
                            <CheckCircle2 className={`h-6 w-6 mr-3 shrink-0 ${isFree ? 'text-zinc-600' : 'text-cyan-500/60'}`} /> {feature}
                          </li>
                        ))}
                      </ul>
                      <div className={`mt-8 w-full py-4 rounded-xl font-bold text-center border-2 transition-colors ${
                        isFree 
                          ? 'border-zinc-800 text-zinc-400 group-hover:border-zinc-600 group-hover:text-zinc-300' 
                          : 'border-cyan-500/30 text-cyan-400 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10'
                      }`}>
                        {isFree ? "Começar Grátis" : `Assinar ${plan.name}`}
                      </div>
                    </div>
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        {/* SECÇÃO PARA USUÁRIOS FINAIS */}
        {placaPlans.length > 0 && (
          <div className="mt-32 text-center max-w-4xl mx-auto">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/50 bg-blue-500/10 px-5 py-2 text-sm font-bold text-blue-500">
              <Search className="h-4 w-4" /> Para Motoristas e Entusiastas
            </div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground mb-4">
              Consulte todo o histórico do veículo
            </h2>
            <p className="text-lg text-foreground/80 font-medium mb-12">
              Basta a placa para ter acesso completo a Chassi, Motor, Renavam e pendências.
            </p>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 max-w-3xl mx-auto items-center justify-center">
              {placaPlans.map((plan) => {
                const featuresArray = Array.isArray(plan.features) 
                  ? plan.features 
                  : typeof plan.features === 'string' 
                    ? JSON.parse(plan.features) 
                    : [];

                return (
                  <div key={plan.id} className="relative glass-panel bg-panel/60 rounded-[2rem] p-8 border border-border-subtle hover:border-blue-500/50 hover:bg-blue-900/10 transition-all flex flex-col h-full text-left mx-auto w-full">
                    <h3 className="text-2xl font-black text-blue-400">{plan.name}</h3>
                    <div className="mt-4 flex flex-col">
                      <div className="flex items-baseline text-5xl font-black text-foreground">
                        <span className="text-2xl text-muted-foreground mr-1">R$</span>
                        {plan.price.toFixed(2).replace('.', ',')}
                      </div>
                      <span className="text-sm font-medium text-muted-foreground mt-1">
                        Pagamento único via PIX
                      </span>
                    </div>
                    <p className="mt-4 text-foreground/80 font-medium">{plan.description}</p>
                    <ul className="mt-6 space-y-3 mb-8 flex-1">
                      {featuresArray.map((feat: string, i: number) => (
                        <li key={i} className="flex items-start text-foreground/90 font-medium">
                          <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0 mr-3 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <Link 
                      href={session ? "/cliente/garagem" : `/login?callbackUrl=/cliente/garagem`}
                      className="w-full flex items-center justify-center h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl transition-colors"
                    >
                      {session ? "Ir para Garagem" : "Criar conta e comprar"}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
