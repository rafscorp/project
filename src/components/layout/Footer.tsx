import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <p className="font-display text-lg font-bold text-foreground">Agury Auto</p>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Plataforma SaaS para oficinas e lojas automotivas. Sua loja online, seus clientes, retirada na loja e mais presença digital.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Empresa</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/planos" className="hover:text-foreground">Planos</Link></li>
              <li><Link href="/cadastro/empresa" className="hover:text-foreground">Cadastrar Loja</Link></li>
              <li><Link href="/como-funciona" className="hover:text-foreground">Como Funciona</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/termos" className="hover:text-foreground">Termos de Uso</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap justify-between gap-4 border-t border-border-subtle pt-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Agury Auto. Todos os direitos reservados.</span>
          <span>Estética & Mecânica Automotiva</span>
        </div>
      </div>
    </footer>
  );
}
