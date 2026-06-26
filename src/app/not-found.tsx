"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SearchX, Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background selection:bg-violet-600/30 overflow-hidden relative">
      <div className="fixed inset-0 z-0 bg-mesh-dark pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-grid-dark opacity-20 pointer-events-none" />
      
      {/* Luzes de Fundo (Neon) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      <main className="relative z-10 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto w-full">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center shadow-2xl relative z-10">
            <SearchX className="w-12 h-12 sm:w-16 sm:h-16 text-amber-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-zinc-100 to-zinc-600 drop-shadow-sm mb-4 tracking-tighter">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Página não encontrada
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Parece que a página que você está procurando entrou em manutenção, foi removida ou nunca existiu.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-border-subtle bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold transition-all shadow-sm gap-2 h-12"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-transparent bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] btn-shimmer gap-2 h-12"
          >
            <Home className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Página Inicial</span>
          </Link>
        </motion.div>

      </main>
    </div>
  );
}
