import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowLeft, User, Shield, Lock, Smartphone } from "lucide-react";
import { AccountForm } from "./AccountForm";

export default async function CustomerAccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      phone: true,
      createdAt: true
    }
  });

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col">
      <div className="fixed inset-0 z-0 bg-mesh-dark pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-grid-dark opacity-30 pointer-events-none" />
      
      {/* Header Minimalista */}
      <header className="relative z-10 h-20 border-b border-border-subtle bg-background/80 backdrop-blur-xl flex items-center px-4 sm:px-8 sticky top-0">
        <Link href="/cliente/home" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mr-8">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium hidden sm:inline">Voltar</span>
        </Link>
        <h1 className="text-xl font-bold font-display text-foreground">Minha Conta</h1>
      </header>

      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 space-y-8">
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar de Perfil Rápido */}
          <div className="w-full md:w-64 shrink-0 space-y-6">
            <div className="glass-panel border border-border-subtle bg-panel/60 p-6 rounded-3xl text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center border border-blue-500/30 mb-4">
                <User className="h-10 w-10" />
              </div>
              <h2 className="font-bold text-foreground text-lg">{user.name}</h2>
              <p className="text-sm text-muted-foreground truncate w-full" title={user.email}>{user.email}</p>
              
              <div className="w-full h-px bg-border-subtle my-4" />
              
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3 text-emerald-400" />
                <span>Membro desde {new Date(user.createdAt).getFullYear()}</span>
              </div>
            </div>
          </div>

          {/* Formulário de Configurações */}
          <div className="flex-1 space-y-6">
            <div className="glass-panel border border-border-subtle bg-panel/40 p-1 rounded-3xl">
              <div className="bg-panel/60 rounded-[1.4rem] p-6 sm:p-8 border border-white/5 dark:border-white/5">
                <h3 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-400" /> Dados Pessoais
                </h3>
                <p className="text-sm text-muted-foreground mb-8">Atualize suas informações de contato e nome de exibição.</p>
                
                <AccountForm 
                  initialData={{ 
                    name: user.name, 
                    phone: user.phone || "" 
                  }} 
                />
              </div>
            </div>

            <div className="glass-panel border border-border-subtle bg-panel/40 p-1 rounded-3xl">
              <div className="bg-panel/60 rounded-[1.4rem] p-6 sm:p-8 border border-white/5 dark:border-white/5">
                <h3 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-amber-400" /> Segurança
                </h3>
                <p className="text-sm text-muted-foreground mb-8">Proteja sua conta alterando a senha regularmente.</p>
                
                {/* Aqui seria um PasswordForm, podemos simplificar criando ambos no AccountForm com abas ou separando */}
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground">Nova Senha</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full bg-zinc-900/50 border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground">Confirmar Nova Senha</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full bg-zinc-900/50 border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                  <button type="button" className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold px-6 py-3 rounded-xl transition-colors w-full sm:w-auto">
                    Atualizar Senha
                  </button>
                </form>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
