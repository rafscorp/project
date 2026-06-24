// Force dynamic rendering for pages with database queries
export const dynamic = 'force-dynamic';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { SubscriptionService } from "@/services/subscription.service";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

export default async function PlanosPage() {
  const plans = await SubscriptionService.listPlans();

  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-white">Planos para sua empresa</h1>
          <p className="mt-2 text-zinc-400">Assinatura mensal — sua loja online completa</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => {
            const features: string[] = JSON.parse(plan.features || "[]");
            return (
              <div key={plan.id} className={`rounded-2xl border p-8 ${i === 1 ? "border-amber-400/50 bg-amber-400/5 scale-105" : "border-zinc-800 bg-zinc-900/50"}`}>
                <h2 className="font-display text-xl font-bold text-white">{plan.name}</h2>
                <p className="mt-4 font-display text-4xl font-extrabold text-white">
                  {formatCurrency(plan.priceMonthly)}<span className="text-lg font-normal text-zinc-500">/mês</span>
                </p>
                <p className="mt-2 text-sm text-zinc-400">{plan.description}</p>
                <ul className="mt-6 space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="h-4 w-4 text-amber-400" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/cadastro/empresa?plan=${plan.slug}`} className="mt-8 block">
                  <Button className="w-full" variant={i === 1 ? "primary" : "secondary"}>
                    Começar 14 dias grátis
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
