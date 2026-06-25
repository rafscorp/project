import { Suspense } from "react";
import Link from "next/link";
import { Store } from "lucide-react";
import { MultiStepStoreRegister } from "@/components/auth/MultiStepStoreRegister";
import { SubscriptionService } from "@/services/subscription.service";

export const dynamic = 'force-dynamic';

export default async function RegisterStorePage() {
  const plans = await SubscriptionService.listPlans();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 selection:bg-violet-600/30">
      <div className="fixed inset-0 z-0 bg-mesh-dark pointer-events-none" />
      
      {/* Simple Header */}
      <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <Store className="h-8 w-8 text-violet-500" />
          <span className="font-display font-bold text-2xl tracking-tight text-white">Agury</span>
        </Link>
        <Link href="/login" className="text-zinc-400 hover:text-white transition-colors font-medium">
          Já tem conta? <span className="text-violet-400">Entrar</span>
        </Link>
      </header>

      {/* Main Wizard Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <Suspense fallback={<div className="text-zinc-500 animate-pulse">Carregando ambiente seguro...</div>}>
          <MultiStepStoreRegister plans={plans.map(p => ({ slug: p.slug, name: p.name, priceMonthly: p.priceMonthly }))} />
        </Suspense>
      </main>
      
    </div>
  );
}
