import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Avatar } from "@/components/ui/Avatar";
import {
  User,
  ShoppingBag,
  Shield,
  Bell,
  LogOut,
  Network
} from "lucide-react";

export default async function ContaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const nav = [
    { href: "/conta", label: "Painel", icon: User },
    { href: "/conta/pedidos", label: "Meus Pedidos", icon: ShoppingBag },
    { href: "/conta/perfil", label: "Meu Perfil", icon: User },
    { href: "/conta/seguranca", label: "Segurança", icon: Shield },
    { href: "/conta/notificacoes", label: "Notificações", icon: Bell },
  ];

  // If user is affiliate or admin, show affiliate panel
  if (session.role === "PLATFORM_ADMIN" || session.role === "STORE_OWNER") {
    nav.push({ href: "/conta/afiliado", label: "Painel Afiliado", icon: Network });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="flex items-center gap-4 mb-8">
              <Avatar name={session.name} size="lg" />
              <div>
                <h2 className="font-display font-bold text-foreground">{session.name}</h2>
                <p className="text-sm text-muted-foreground">@{session.username}</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {nav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-panel hover:text-foreground"
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ))}
              <form action="/api/auth/logout" method="POST" className="pt-4 mt-4 border-t border-border-subtle">
                <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors">
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </form>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-panel/30 rounded-2xl border border-border-subtle p-6 lg:p-8">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}
