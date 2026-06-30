import { Suspense } from "react";
import Link from "next/link";
import { Store } from "lucide-react";
import { MultiStepStoreRegister } from "@/components/auth/MultiStepStoreRegister";
import { SubscriptionService } from "@/services/subscription.service";
import { B2BMarketingSection } from "@/components/marketing/B2BMarketingSection";

export const dynamic = 'force-dynamic';

export default async function RegisterStorePage() {

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-violet-600/30">
      <div className="fixed inset-0 z-0 bg-mesh-premium pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-grid-premium opacity-40 pointer-events-none" />
      
      {/* Simple Header */}
      <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <Store className="h-8 w-8 text-violet-500" />
          <span className="font-display font-bold text-2xl tracking-tight text-foreground">ConectaParts</span>
        </Link>
        <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
          Já tem conta? <span className="text-violet-400">Entrar</span>
        </Link>
      </header>

      {/* Marketing Section */}
      <div className="relative z-10 w-full bg-background/50 backdrop-blur-xl border-b border-border-subtle mb-12">
        <B2BMarketingSection />
      </div>

      {/* Main Wizard Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center p-4 pt-12 pb-24">
        <div className="w-full max-w-3xl mx-auto mb-8 text-center">
          <h2 className="text-3xl font-display font-black text-foreground mb-4">Crie sua Conta Lojista</h2>
          <p className="text-muted-foreground font-medium">Preencha os dados abaixo para configurar o seu balcão digital.</p>
        </div>
        <Suspense fallback={<div className="text-muted-foreground animate-pulse">Carregando ambiente seguro...</div>}>
          <MultiStepStoreRegister />
        </Suspense>
      </main>
      
    </div>
  );
}
