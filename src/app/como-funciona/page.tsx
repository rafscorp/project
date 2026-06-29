import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Store, User, CreditCard } from "lucide-react";

export default function ComoFuncionaPage() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0 bg-mesh-premium pointer-events-none hidden sm:block" />
      <div className="fixed inset-0 z-0 bg-grid-premium opacity-40 pointer-events-none hidden sm:block" />
      
      <Navbar />
      
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-24 sm:px-6 flex-1">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl sm:text-5xl font-black text-foreground mb-4">Como funciona</h1>
          <p className="text-xl text-muted-foreground font-medium">Conectando empresas e motoristas de forma inteligente.</p>
        </div>

        <div className="mt-8 space-y-8">
          <section className="glass-panel p-8 rounded-3xl border border-border-subtle hover:border-violet-500/30 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-violet-500/20 p-3 rounded-2xl">
                <Store className="h-6 w-6 text-violet-500" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Para Empresas</h2>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Oficinas e lojas automotivas assinam um plano mensal da Agury. Ganham loja online personalizada, painel de pedidos inteligente e catálogo de produtos automatizado para organizar as vendas e fidelizar clientes.
            </p>
          </section>

          <section className="glass-panel p-8 rounded-3xl border border-border-subtle hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-500/20 p-3 rounded-2xl">
                <User className="h-6 w-6 text-blue-500" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Para Clientes</h2>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Motoristas acessam a loja digital da empresa, compram peças e agendam serviços online, e realizam a retirada/serviço no endereço físico. Você ganha agilidade, sem filas e com histórico completo do seu carro.
            </p>
          </section>

          <section className="glass-panel p-8 rounded-3xl border border-border-subtle hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-emerald-500/20 p-3 rounded-2xl">
                <CreditCard className="h-6 w-6 text-emerald-500" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Modelo Simples</h2>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              A Agury é uma plataforma de gestão e relacionamento. Nós fornecemos a tecnologia para a empresa através de uma mensalidade fixa. Sem taxas ocultas e sem comissões intermediárias por venda.
            </p>
          </section>
        </div>

        <div className="mt-16 text-center">
          <Link href="/cadastro/empresa" className="inline-flex items-center justify-center px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-transform hover:scale-105 btn-shimmer">
            <span className="relative z-20">Criar minha loja agora</span>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
