import Link from "next/link";
import { ArrowLeft, CarFront, Store, User } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 selection:bg-violet-600/30">
      <div className="fixed inset-0 z-0 bg-mesh-dark pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-grid-dark opacity-20 pointer-events-none" />
      
      {/* Top Header Simplificado com Voltar */}
      <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-medium">
          <ArrowLeft className="h-5 w-5" /> Voltar para o início
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <CarFront className="h-8 w-8 text-violet-500" />
          <span className="font-display font-bold text-2xl tracking-tight text-white hidden sm:block">Agury</span>
        </Link>
      </header>

      {/* Area de Login */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto glass-panel p-6 sm:p-8 rounded-[1.5rem] border-violet-500/20 shadow-[0_0_50px_rgba(139,92,246,0.1)]">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-display font-black text-white mb-1">Entrar</h1>
            <p className="text-zinc-400 font-medium text-sm">Acesse sua conta para continuar.</p>
          </div>
          
          <LoginForm />
          
          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <p className="text-zinc-400 text-sm mb-3">Ainda não tem conta na Agury?</p>
            <Link href="/cadastro" className="inline-block w-full text-center py-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white font-bold transition-colors shadow-sm btn-shimmer">
              <span className="relative z-20">Criar uma conta</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
