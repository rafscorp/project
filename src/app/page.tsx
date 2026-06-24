import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { StoreService } from "@/services/store.service";
import { SubscriptionService } from "@/services/subscription.service";
import { formatCurrency } from "@/lib/utils/format";
import {
  ArrowRight, Store, ShoppingBag, CreditCard, Truck,
  CheckCircle2, Zap, Shield,
} from "lucide-react";

export default async function HomePage() {
  const [storesResult, plansResult] = await Promise.allSettled([
    StoreService.listPublic(6),
    SubscriptionService.listPlans(),
  ]);

  const stores = storesResult.status === "fulfilled" ? storesResult.value : [];
  const plans = plansResult.status === "fulfilled" ? plansResult.value : [];

  return (
    <div className="bg-mesh glow-amber min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative px-4 pb-20 pt-28 sm:px-6 lg:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-semibold text-amber-400">
                <Zap className="h-4 w-4" /> Plataforma SaaS Automotiva
              </div>
              <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Sua oficina online.{" "}
                <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                  Seus clientes compram. Retiram na loja.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-zinc-400">
                Igual Trinks e SalonSoft, mas para estética e mecânica automotiva.
                Empresas pagam assinatura mensal, têm loja própria no site e vendem peças e serviços.
                Sem entrega — cliente retira na sua loja.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/cadastro/empresa">
                  <Button size="lg">
                    Começar 14 dias grátis <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/loja/diamond-car">
                  <Button variant="outline" size="lg">Ver loja demo</Button>
                </Link>
              </div>
              <div className="mt-10 flex gap-8 border-t border-zinc-800 pt-8">
                <div>
                  <p className="font-display text-2xl font-bold text-amber-400">14 dias</p>
                  <p className="text-sm text-zinc-500">Teste grátis</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-amber-400">0%</p>
                  <p className="text-sm text-zinc-500">Comissão por venda*</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-amber-400">100%</p>
                  <p className="text-sm text-zinc-500">Seu controle</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl backdrop-blur">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-400">Painel da Loja</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">Online</span>
                </div>
                <div className="space-y-3">
                  {["Novo pedido #AGU-001 — R$ 189,90", "Cliente retirou — Pastilha freio", "Assinatura Professional ativa"].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-zinc-800/50 p-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" />
                      <span className="text-zinc-300">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona — modelo de negócio */}
      <section className="border-y border-zinc-800 bg-zinc-900/30 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">Modelo de Negócio</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Como a Agury funciona</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: CreditCard, title: "1. Empresa assina", desc: "Oficina ou loja paga mensalidade à Agury e ganha loja online personalizada." },
              { icon: ShoppingBag, title: "2. Cliente compra", desc: "Cliente final acessa a loja da empresa, adiciona peças/serviços ao carrinho e finaliza." },
              { icon: Truck, title: "3. Retira na loja", desc: "Sem entrega. Cliente vai até a loja física com código de retirada e pega o pedido." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-lg font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos preview */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-white">Planos para sua empresa</h2>
            <p className="mt-2 text-zinc-400">Escolha o plano e comece a vender online hoje</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan, i) => (
              <div
                key={plan.id}
                className={`rounded-2xl border p-8 ${i === 1 ? "border-amber-400/50 bg-amber-400/5" : "border-zinc-800 bg-zinc-900/50"}`}
              >
                {i === 1 && <span className="text-xs font-bold uppercase text-amber-400">Mais popular</span>}
                <h3 className="mt-1 font-display text-xl font-bold text-white">{plan.name}</h3>
                <p className="mt-4">
                  <span className="font-display text-4xl font-extrabold text-white">{formatCurrency(plan.priceMonthly)}</span>
                  <span className="text-zinc-500">/mês</span>
                </p>
                <p className="mt-2 text-sm text-zinc-400">{plan.description}</p>
                <Link href={`/cadastro/empresa?plan=${plan.slug}`} className="mt-6 block">
                  <Button variant={i === 1 ? "primary" : "secondary"} className="w-full">Assinar</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lojas */}
      {stores.length > 0 && (
        <section className="border-t border-zinc-800 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-2xl font-bold text-white">Lojas na plataforma</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((store) => (
                <Link key={store.id} href={`/loja/${store.slug}`} className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-amber-400/30">
                  <Store className="h-8 w-8 text-amber-400" />
                  <h3 className="mt-3 font-display font-bold text-white group-hover:text-amber-400">{store.name}</h3>
                  <p className="text-sm text-zinc-500">{store.city}/{store.state}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 to-transparent p-10 text-center">
          <Shield className="mx-auto h-10 w-10 text-amber-400" />
          <h2 className="mt-4 font-display text-2xl font-bold text-white">Pronto para digitalizar sua oficina?</h2>
          <p className="mt-2 text-zinc-400">14 dias grátis. Sem cartão. Cancele quando quiser.</p>
          <Link href="/cadastro/empresa" className="mt-6 inline-block">
            <Button size="lg">Criar minha loja agora</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
