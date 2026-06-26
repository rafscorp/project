import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { StoreService } from "@/services/store.service";
import {
  LayoutDashboard, Package, ShoppingBag, CreditCard, Settings, LogOut, Car,
} from "lucide-react";

const nav = [
  { href: "/loja/painel", label: "Dashboard", icon: LayoutDashboard },
  { href: "/loja/painel/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/loja/painel/produtos", label: "Produtos", icon: Package },
  { href: "/loja/painel/assinatura", label: "Assinatura", icon: CreditCard },
  { href: "/loja/painel/configuracoes", label: "Configurações", icon: Settings },
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
        <nav className="p-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-zinc-800/50 hover:text-white"
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
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
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
