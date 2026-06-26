import Link from "next/link";
import { UserCircle, Car, Search, LogOut } from "lucide-react";

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar do Cliente */}
      <aside className="w-full md:w-64 bg-panel border-b md:border-b-0 md:border-r border-border-subtle flex flex-col shrink-0 md:sticky md:top-0 md:h-screen">
        <div className="p-6 border-b border-border-subtle flex justify-between items-center md:block">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <UserCircle className="h-6 w-6 text-emerald-500" />
            <span className="font-display font-black text-xl tracking-tight">Meu <span className="text-emerald-500">Painel</span></span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-x-auto md:overflow-x-visible flex md:flex-col">
          <Link href="/painel/cliente/orcamentos" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 whitespace-nowrap">
            <Car className="h-5 w-5" /> Meus Orçamentos
          </Link>
          <Link href="/lojas" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-white hover:bg-zinc-800 transition-colors font-medium whitespace-nowrap">
            <Search className="h-5 w-5" /> Buscar Oficinas
          </Link>
        </nav>

        <div className="p-4 border-t border-border-subtle space-y-2 hidden md:block">
          <Link href="/api/auth/logout" className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-colors font-bold">
            <LogOut className="h-5 w-5" /> Sair
          </Link>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-background/50 backdrop-blur-xl border-b border-border-subtle flex items-center px-8 sticky top-0 z-10 hidden md:flex">
          <div className="font-medium text-muted-foreground">
            Painel do Cliente
          </div>
        </header>
        
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
