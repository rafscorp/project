import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  LayoutDashboard,
  Store,
  Users,
  ShoppingBag,
  CreditCard,
  Ticket,
  Network,
  DollarSign,
  ShieldAlert,
  Settings,
  LogOut,
  Car,
} from "lucide-react";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/lojas", label: "Lojas", icon: Store },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/assinaturas", label: "Assinaturas", icon: CreditCard },
  { href: "/admin/cupons", label: "Cupons", icon: Ticket },
  { href: "/admin/afiliados", label: "Afiliados", icon: Network },
  { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/admin/auditoria", label: "Auditoria", icon: ShieldAlert },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "PLATFORM_ADMIN") redirect("/login");

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <aside className="relative hidden min-h-screen w-64 shrink-0 border-r border-zinc-800 bg-zinc-900/50 lg:block flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-6">
          <Car className="h-6 w-6 text-amber-400" />
          <span className="font-display font-bold text-white">Agury Admin</span>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800/50 hover:text-white"
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-zinc-800 p-4">
          <div className="mb-4 px-2">
            <p className="text-sm font-semibold text-white">{session.name}</p>
            <p className="text-xs text-zinc-500">{session.email}</p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors">
              <LogOut className="h-4 w-4" /> Sair do Painel
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden h-screen">
        <div className="border-b border-zinc-800 px-6 py-4 lg:hidden">
          <p className="font-display font-bold text-white">Agury Admin</p>
        </div>
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
