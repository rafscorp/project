import Link from "next/link";
import { Store, Package, Star, CreditCard, Settings, LogOut, Bell, AlertTriangle, Users, Ticket } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { StoreService } from "@/services/store.service";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || !session.storeId) redirect("/login");

  const store = await StoreService.getById(session.storeId);
  if (!store) redirect("/login");

  const fomoStatus = StoreService.getFomoStatus(store);
  const isHardLocked = fomoStatus === "HARD_LOCK";

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex">
      {/* Sidebar Administrativa */}
      <aside className="w-64 bg-panel border-r border-border-subtle flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-border-subtle">
          <Link href="/dashboard" className="flex items-center gap-2 text-foreground">
            <Store className="h-6 w-6 text-violet-500" />
            <span className="font-display font-black text-xl tracking-tight">Agury <span className="text-violet-500">Store</span></span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {!isHardLocked ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-500/10 text-violet-400 font-bold border border-violet-500/20">
                <Store className="h-5 w-5" /> Painel Geral
              </Link>
              <Link href="/dashboard/produtos" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-white hover:bg-zinc-800 transition-colors font-medium">
                <Package className="h-5 w-5" /> Produtos & Peças
              </Link>
              <Link href="/dashboard/avaliacoes" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-white hover:bg-zinc-800 transition-colors font-medium">
                <Star className="h-5 w-5" /> Avaliações
              </Link>
              <Link href="/dashboard/clientes" className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-400 hover:text-white hover:bg-zinc-800 transition-colors font-bold mt-2">
                <Users className="h-5 w-5" /> CRM de Clientes
              </Link>
              <Link href="/dashboard/cupons" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-white hover:bg-zinc-800 transition-colors font-medium">
                <Ticket className="h-5 w-5" /> Cupons de Desconto
              </Link>
              <Link href="/dashboard/orcamentos" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-white hover:bg-zinc-800 transition-colors font-medium">
                <Package className="h-5 w-5" /> Orçamentos
              </Link>
              <Link href="/dashboard/pedidos" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-white hover:bg-zinc-800 transition-colors font-medium">
                <Package className="h-5 w-5" /> Encomendas
              </Link>
              <Link href="/dashboard/assinatura" className="flex items-center gap-3 px-4 py-3 rounded-xl text-amber-500/80 hover:text-amber-400 hover:bg-amber-500/10 transition-colors font-medium mt-4">
                <Settings className="h-5 w-5" /> Assinatura & Limites
              </Link>
            </>
          ) : (
            <div className="px-4 py-3 text-red-400 font-bold flex items-center gap-2 bg-red-500/10 rounded-xl">
              <AlertTriangle className="h-5 w-5" /> Conta Suspensa
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-border-subtle space-y-2">
          {!isHardLocked && (
            <Link href="/dashboard/configuracoes" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-white hover:bg-zinc-800 transition-colors font-medium">
              <Settings className="h-5 w-5" /> Configurações
            </Link>
          )}
          <Link href="/api/auth/logout" className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-colors font-bold">
            <LogOut className="h-5 w-5" /> Sair da Loja
          </Link>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-background/50 backdrop-blur-xl border-b border-border-subtle flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="font-medium text-muted-foreground">
            Bem-vindo ao Painel da Oficina
          </div>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-violet-500 rounded-full ring-2 ring-zinc-950 dark:ring-zinc-950 ring-white" />
            </button>
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-border-subtle flex items-center justify-center font-bold text-violet-400 overflow-hidden">
              {store.logoUrl ? <img src={store.logoUrl} className="w-full h-full object-cover" /> : store.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-foreground leading-tight">{store.name}</p>
              <p className="text-xs text-muted-foreground font-medium">Plano {store.subscription?.plan?.name || "Básico"}</p>
            </div>
          </div>
        </header>

        {fomoStatus === "SOFT_LOCK" && (
          <div className="bg-red-500 text-white px-8 py-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm font-bold">Aviso: Seu plano expirou e sua loja será suspensa em breve. Você não poderá responder mensagens até renovar.</p>
            </div>
            <Link href="/dashboard/pagamento" className="bg-white text-red-600 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-zinc-100 transition-colors">
              Renovar Plano
            </Link>
          </div>
        )}
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
