"use client";

import Link from "next/link";
import { ArrowLeft, CarFront, Store, User } from "lucide-react";
import { motion } from "framer-motion";

import { BackButton } from "@/components/BackButton";

export const dynamic = 'force-dynamic';

export default function CadastroSelectorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-violet-600/30">
      <div className="fixed inset-0 z-0 bg-mesh-premium pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-grid-premium opacity-20 pointer-events-none" />
      
      {/* Botão Global de Voltar */}
      <BackButton />

      <header className="relative z-10 p-6 flex justify-end items-center max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <CarFront className="h-8 w-8 text-violet-500" />
          <span className="font-display font-bold text-2xl tracking-tight text-foreground hidden sm:block">Agury</span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md mx-auto glass-panel p-6 sm:p-8 rounded-[1.5rem] border-violet-500/20 shadow-[0_0_50px_rgba(139,92,246,0.1)] text-center"
        >
          <h1 className="text-3xl font-display font-black text-foreground mb-2">Criar Conta</h1>
          <p className="text-muted-foreground font-medium text-sm mb-8">Como você deseja usar a plataforma?</p>
          
          <div className="flex flex-col gap-4">
            <Link href="/cadastro/cliente" className="group relative overflow-hidden flex items-center p-5 rounded-2xl border border-blue-500/20 bg-background hover:bg-muted transition-colors shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mr-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <User className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-foreground text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Sou Cliente</h3>
                <p className="text-muted-foreground text-sm">Quero comprar peças e agendar serviços.</p>
              </div>
            </Link>

            <Link href="/cadastro/empresa" className="group relative overflow-hidden flex items-center p-5 rounded-2xl border border-violet-500/20 bg-background hover:bg-muted transition-colors shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 mr-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <Store className="h-6 w-6 text-violet-500 dark:text-violet-400" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-foreground text-lg group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Sou Lojista / Oficina</h3>
                <p className="text-muted-foreground text-sm">Quero vender e digitalizar meu negócio.</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
