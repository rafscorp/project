import Link from "next/link";
import { CarFront, Store, MapPin, Search, User, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function CustomerDashboard() {
  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col">
      <div className="fixed inset-0 z-0 bg-mesh-dark pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-grid-dark opacity-30 pointer-events-none" />
      
      {/* Header Cliente */}
      <header className="relative z-10 h-20 border-b border-border-subtle bg-background/80 backdrop-blur-xl flex justify-between items-center px-4 sm:px-8 sticky top-0">
        <Link href="/cliente/home" className="flex items-center gap-2">
          <CarFront className="h-6 w-6 text-blue-500" />
          <span className="font-display font-black text-xl text-foreground tracking-tight">Agury <span className="text-blue-500">Auto</span></span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/lojas" className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
            <Store className="h-5 w-5" /> Encontrar Oficinas
          </Link>
          <ThemeToggle />
          <div className="flex items-center gap-3 border-l border-border-subtle pl-6">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <User className="h-5 w-5" />
            </div>
            <Link href="/api/auth/logout" className="p-2 text-muted-foreground hover:text-red-400 transition-colors" title="Sair">
              <LogOut className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-8 mt-8">
        <div>
          <h1 className="text-4xl font-display font-black text-foreground">Olá, Cliente!</h1>
          <p className="text-muted-foreground mt-2 text-lg">O que seu veículo precisa hoje?</p>
        </div>

        {/* Busca Gigante */}
        <div className="glass-panel p-2 rounded-full border border-border-subtle bg-panel/60 flex max-w-3xl">
          <div className="flex-1 flex items-center px-6 border-r border-border-subtle">
            <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
            <input 
              type="text" 
              placeholder="Buscar pneu, óleo, pastilha de freio..." 
              className="w-full bg-transparent border-none text-foreground focus:ring-0 placeholder:text-zinc-600 outline-none text-lg"
            />
          </div>
          <div className="w-48 hidden sm:flex items-center px-4">
            <MapPin className="h-5 w-5 text-muted-foreground mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Sua cidade" 
              className="w-full bg-transparent border-none text-foreground focus:ring-0 placeholder:text-zinc-600 outline-none"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-full transition-colors ml-2">
            Buscar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          <div className="glass-panel p-8 rounded-3xl border border-border-subtle bg-panel/40 hover:bg-panel/80 transition-colors group cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-border-subtle flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CarFront className="h-7 w-7 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Meus Veículos</h3>
            <p className="text-muted-foreground">Cadastre seus carros para achar peças compatíveis automaticamente.</p>
          </div>

          <Link href="/lojas" className="block group">
            <div className="glass-panel p-8 rounded-3xl border border-border-subtle bg-panel/40 hover:bg-panel/80 transition-colors h-full">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-border-subtle flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Store className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Oficinas 5 Estrelas</h3>
              <p className="text-muted-foreground">Explore o diretório e encontre os profissionais mais bem avaliados.</p>
            </div>
          </Link>

          <Link href="/cliente/orcamentos" className="block group">
            <div className="glass-panel p-8 rounded-3xl border border-border-subtle bg-panel/40 hover:bg-panel/80 transition-colors h-full">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-border-subtle flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Meus Pedidos & Chat</h3>
              <p className="text-muted-foreground">Acompanhe compras, negocie com lojistas e veja seus orçamentos.</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
