import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { CustomerQuotesClient } from "./CustomerQuotesClient";
import Link from "next/link";
import { CarFront, Store, MapPin, Search, User, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function CustomerQuotesPage() {
  const session = await getSession();

  if (!session || session.role !== "CUSTOMER") {
    redirect("/login");
  }

  // Busca os orçamentos do cliente
  const quotes = await prisma.quoteRequest.findMany({
    where: { customerId: session.userId },
    orderBy: { updatedAt: "desc" },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
          logoUrl: true,
          phone: true
        }
      }
    }
  });

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

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-8 mt-4">
        <div>
          <h1 className="text-4xl font-display font-black text-foreground">Meus Pedidos & Orçamentos</h1>
          <p className="text-muted-foreground mt-2 text-lg">Acompanhe as negociações com as oficinas.</p>
        </div>

        <CustomerQuotesClient initialQuotes={quotes} />
      </main>
    </div>
  );
}
