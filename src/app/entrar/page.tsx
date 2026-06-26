"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, UserPlus, LogIn, ChevronRight } from "lucide-react";
import { BackButton } from "@/components/BackButton";

export const dynamic = 'force-dynamic';

export default function HubAcessoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-violet-600/30">
      <div className="fixed inset-0 z-0 bg-mesh-dark pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-grid-dark opacity-20 pointer-events-none" />
      
      {/* Botão de Voltar Dinâmico */}
      <header className="relative z-50 p-6 sm:p-8">
        <BackButton />
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl mx-auto text-center"
        >
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-display font-black text-foreground mb-4">Acesse sua Conta</h1>
            <p className="text-muted-foreground text-lg sm:text-xl">O ecossistema automotivo inteligente. O que você deseja fazer?</p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Card Login */}
            <Link href="/login" className="group relative overflow-hidden flex flex-col items-center p-10 rounded-[2rem] border border-violet-500/20 bg-background hover:bg-muted shadow-xl hover:shadow-[0_0_50px_rgba(139,92,246,0.2)] transition-all hover:-translate-y-2 duration-300 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className="w-24 h-24 rounded-3xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                <LogIn className="h-12 w-12 text-violet-600 dark:text-violet-400" />
              </div>
              
              <h3 className="font-display font-black text-foreground text-2xl mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Fazer Login</h3>
              <p className="text-muted-foreground text-center">Acessar minha conta existente na Agury.</p>
              
              <div className="mt-8 flex items-center justify-center w-12 h-12 rounded-full bg-violet-500 text-white opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                <ChevronRight className="h-6 w-6" />
              </div>
            </Link>

            {/* Card Cadastro */}
            <Link href="/cadastro" className="group relative overflow-hidden flex flex-col items-center p-10 rounded-[2rem] border border-emerald-500/20 bg-background hover:bg-muted shadow-xl hover:shadow-[0_0_50px_rgba(16,185,129,0.2)] transition-all hover:-translate-y-2 duration-300 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className="w-24 h-24 rounded-3xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <UserPlus className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              
              <h3 className="font-display font-black text-foreground text-2xl mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Criar Nova Conta</h3>
              <p className="text-muted-foreground text-center">Ainda não sou cliente. Quero me cadastrar.</p>
              
              <div className="mt-8 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-white opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                <ChevronRight className="h-6 w-6" />
              </div>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
