import Link from "next/link";
import { ArrowLeft, CarFront, Store, User } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function CadastroSelectorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 selection:bg-violet-600/30">
      <div className="fixed inset-0 z-0 bg-mesh-dark pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-grid-dark opacity-20 pointer-events-none" />
      
      <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href="/login" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-medium">
          <ArrowLeft className="h-5 w-5" /> Voltar para Login
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <CarFront className="h-8 w-8 text-violet-500" />
          <span className="font-display font-bold text-2xl tracking-tight text-white hidden sm:block">Agury</span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto glass-panel p-6 sm:p-8 rounded-[1.5rem] border-violet-500/20 shadow-[0_0_50px_rgba(139,92,246,0.1)] text-center">
          <h1 className="text-3xl font-display font-black text-white mb-2">Criar Conta</h1>
          <p className="text-zinc-400 font-medium text-sm mb-8">Como você deseja usar a plataforma?</p>
          
          <div className="flex flex-col gap-4">
            <Link href="/cadastro/cliente" className="group relative overflow-hidden flex items-center p-5 rounded-2xl border border-blue-500/20 bg-zinc-900/50 hover:bg-zinc-800 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mr-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <User className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">Sou Cliente</h3>
                <p className="text-zinc-400 text-sm">Quero comprar peças e agendar serviços.</p>
              </div>
            </Link>

            <Link href="/cadastro/empresa" className="group relative overflow-hidden flex items-center p-5 rounded-2xl border border-violet-500/20 bg-zinc-900/50 hover:bg-zinc-800 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 mr-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <Store className="h-6 w-6 text-violet-400" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white text-lg group-hover:text-violet-400 transition-colors">Sou Lojista / Oficina</h3>
                <p className="text-zinc-400 text-sm">Quero vender e digitalizar meu negócio.</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
