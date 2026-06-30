"use client";

import Link from "next/link";
import { ArrowLeft, CarFront, Store, User } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { motion } from "framer-motion";
import { BackButton } from "@/components/BackButton";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-violet-600/30">
      <div className="fixed inset-0 z-0 bg-mesh-premium pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-grid-premium opacity-20 pointer-events-none" />
      
      {/* Botão Global de Voltar */}
      <BackButton />

      {/* Top Header Simplificado */}
      <header className="relative z-10 p-6 flex justify-end items-center max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <CarFront className="h-8 w-8 text-violet-500" />
          <span className="font-display font-bold text-2xl tracking-tight text-foreground hidden sm:block">ConectaParts</span>
        </Link>
      </header>

      {/* Area de Login */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md mx-auto glass-panel p-6 sm:p-8 rounded-[1.5rem] border-violet-500/20 shadow-[0_0_50px_rgba(139,92,246,0.1)]"
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-display font-black text-foreground mb-1">Entrar</h1>
            <p className="text-muted-foreground font-medium text-sm">Acesse sua conta para continuar.</p>
          </div>
          
          <LoginForm />
          
          <div className="mt-6 pt-5 border-t border-border-subtle text-center">
            <p className="text-muted-foreground text-sm mb-3">Ainda não tem conta na Agury?</p>
            <Link href="/cadastro" className="inline-block w-full text-center py-3 rounded-xl border border-border-subtle bg-background hover:bg-muted text-foreground font-bold transition-colors shadow-sm btn-shimmer">
              <span className="relative z-20">Criar uma conta</span>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* 🔴 DEBUG FLOATING WIDGET - REMOVER DEPOIS 🔴 */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-violet-500/30 text-xs sm:text-sm shadow-2xl backdrop-blur-md">
        <div className="font-bold mb-3 uppercase text-violet-400 tracking-wider flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
          </span>
          Credenciais de Teste
        </div>
        <ul className="space-y-3">
          <li className="flex flex-col">
            <span className="font-black text-zinc-100">Admin</span>
            <span className="font-mono text-zinc-400">admin@agury.com.br</span>
            <span className="font-mono text-zinc-500">Senha: agury123</span>
          </li>
          <li className="flex flex-col">
            <span className="font-black text-zinc-100">Loja</span>
            <span className="font-mono text-zinc-400">loja@agurydemo.com.br</span>
            <span className="font-mono text-zinc-500">Senha: agury123</span>
          </li>
          <li className="flex flex-col">
            <span className="font-black text-zinc-100">Cliente</span>
            <span className="font-mono text-zinc-400">cliente@email.com</span>
            <span className="font-mono text-zinc-500">Senha: agury123</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
