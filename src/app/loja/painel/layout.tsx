import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { StoreService } from "@/services/store.service";
import { SidebarNav } from "@/components/store/SidebarNav";
import {
  LayoutDashboard, Package, ShoppingBag, CreditCard, Settings, LogOut, Car, AlertTriangle, Users
} from "lucide-react";

const nav = [
  { href: "/loja/painel", label: "Dashboard", iconName: "LayoutDashboard" },
  { href: "/loja/painel/chat", label: "Mensagens", iconName: "MessageSquare" },
  { href: "/loja/painel/pedidos", label: "Pedidos", iconName: "ShoppingBag" },
  { href: "/loja/painel/fila", label: "Fila de Clientes", iconName: "Users" },
  { href: "/loja/painel/produtos", label: "Produtos", iconName: "Package" },
  { href: "/loja/painel/assinatura", label: "Assinatura", iconName: "CreditCard" },
  { href: "/loja/painel/configuracoes", label: "Configurações", iconName: "Settings" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.storeId && session?.role !== "PLATFORM_ADMIN") redirect("/login");

  const store = session?.storeId ? await StoreService.getById(session.storeId) : null;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="relative hidden min-h-screen w-64 shrink-0 border-r border-border-subtle bg-panel/50 lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-border-subtle px-6">
          <Car className="h-6 w-6 text-amber-400" />
          <span className="font-display font-bold text-foreground">Agury</span>
        </div>
        <SidebarNav items={nav} />
        <div className="absolute bottom-4 left-4 right-4 lg:w-56">
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-red-400">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border-subtle px-6 py-4 lg:hidden">
          <p className="font-display font-bold text-foreground">{store?.name || "Painel"}</p>
        </div>
        {store?.subscription && !["ACTIVE", "TRIAL"].includes(store.subscription.status) && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <p className="text-sm font-medium text-amber-200">
                <strong className="text-amber-500">Modo Vitrine:</strong> Você está visualizando o painel em modo leitura. Assine um plano para liberar vendas e cadastro de produtos.
              </p>
            </div>
            <Link href="/loja/painel/assinatura" className="text-xs bg-amber-500 text-amber-950 font-bold px-3 py-1.5 rounded-md hover:bg-amber-400 transition">
              Ver Planos
            </Link>
          </div>
        )}
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
