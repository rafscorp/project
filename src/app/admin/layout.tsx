import Link from "next/link";
import { 
  LayoutDashboard, 
  Store, 
  CreditCard, 
  Settings, 
  LogOut, 
  ShieldCheck,
  Users,
  LifeBuoy,
  Radio
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session || session.role !== "PLATFORM_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex">
      {/* Sidebar Administrativa */}
      <aside className="w-64 bg-panel border-r border-border-subtle flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
            <span className="font-display font-black text-xl tracking-tight">Agury <span className="text-emerald-500">Admin</span></span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-white hover:bg-zinc-800 transition-colors font-medium">
            <LayoutDashboard className="h-5 w-5" /> Visão Geral
          </Link>
          <Link href="/admin/lojas" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-white hover:bg-zinc-800 transition-colors font-medium">
            <Store className="h-5 w-5" /> Gestão de Lojas
          </Link>
          <Link href="/admin/tickets" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-400 hover:text-white hover:bg-zinc-800 transition-colors font-bold mt-2">
            <LifeBuoy className="h-5 w-5" /> Tickets de Suporte
          </Link>
          <Link href="/admin/planos" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-white hover:bg-zinc-800 transition-colors font-medium">
            <CreditCard className="h-5 w-5" /> Planos Financeiros
          </Link>
          <Link href="/admin/juridico" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-white hover:bg-zinc-800 transition-colors font-medium">
            <ShieldCheck className="h-5 w-5" /> Documentos Legais
          </Link>
        </nav>

        <div className="p-4 border-t border-border-subtle space-y-2">
          <Link href="/api/auth/logout" className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-colors font-bold">
            <LogOut className="h-5 w-5" /> Sair do Painel
          </Link>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-background/50 backdrop-blur-xl border-b border-border-subtle flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="font-medium text-muted-foreground">
            Control Center — Agury Platform
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-foreground leading-tight">{session.name}</p>
              <p className="text-xs text-emerald-400 font-medium">Platform Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 overflow-hidden">
              {session.name.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
