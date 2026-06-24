import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-lg font-bold text-white">Agury Auto</p>
            <p className="mt-2 max-w-sm text-sm text-zinc-500">
              Plataforma SaaS para oficinas e lojas automotivas. Sua loja online, seus clientes, retirada na loja.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Empresa</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-500">
              <li><Link href="/planos" className="hover:text-amber-400">Planos</Link></li>
              <li><Link href="/cadastro/empresa" className="hover:text-amber-400">Cadastrar Loja</Link></li>
              <li><Link href="/como-funciona" className="hover:text-amber-400">Como Funciona</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-500">
              <li><Link href="/termos" className="hover:text-amber-400">Termos de Uso</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap justify-between gap-4 border-t border-zinc-800 pt-6 text-xs text-zinc-600">
          <span>© {new Date().getFullYear()} Agury Auto. Todos os direitos reservados.</span>
          <span>Estética & Mecânica Automotiva</span>
        </div>
      </div>
    </footer>
  );
}
