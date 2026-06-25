import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/Button";
import { Car, Menu, Sparkles } from "lucide-react";

/** Navbar principal da plataforma */
export async function Navbar() {
  const session = await getSession();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-bold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Car className="h-5 w-5" />
          </span>
          <span className="flex items-center gap-2">
            Agury Auto
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-700">
              Premium
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/planos">Planos</NavLink>
          <NavLink href="/lojas">Lojas</NavLink>
          <NavLink href="/como-funciona">Como Funciona</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <DashboardLink role={session.role} />
              <form action="/api/auth/logout" method="POST">
                <Button type="submit" variant="ghost" size="sm">Sair</Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link href="/cadastro/empresa">
                <Button size="sm" className="gap-2">
                  <Sparkles className="h-4 w-4" /> Começar Grátis
                </Button>
              </Link>
            </>
          )}
          <button className="rounded-lg p-2 text-slate-500 md:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
      {children}
    </Link>
  );
}

function DashboardLink({ role }: { role: string }) {
  const href =
    role === "PLATFORM_ADMIN" ? "/admin" :
    role === "STORE_OWNER" || role === "STORE_STAFF" ? "/loja/painel" :
    "/conta";

  const label =
    role === "PLATFORM_ADMIN" ? "Admin" :
    role === "STORE_OWNER" || role === "STORE_STAFF" ? "Minha Loja" :
    "Minha Conta";

  return (
    <Link href={href}>
      <Button variant="secondary" size="sm">{label}</Button>
    </Link>
  );
}
