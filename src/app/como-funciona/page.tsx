import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function ComoFuncionaPage() {
  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-foreground">Como funciona</h1>
        <div className="mt-8 space-y-8 text-muted-foreground">
          <section>
            <h2 className="font-display text-xl font-bold text-amber-400">Para empresas (nossos clientes)</h2>
            <p className="mt-2">Oficinas e lojas automotivas assinam um plano mensal da Agury. Ganham loja online personalizada, painel de pedidos e catálogo de produtos.</p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-amber-400">Para clientes finais</h2>
            <p className="mt-2">Acessam a loja da empresa, compram peças e serviços, e retiram no endereço físico da loja. Sem entrega — igual Trinks e SalonSoft.</p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-amber-400">Modelo de receita</h2>
            <p className="mt-2">A Agury cobra mensalidade das empresas. O pagamento do pedido é combinado entre cliente e loja (integração automática em breve).</p>
          </section>
        </div>
        <Link href="/cadastro/empresa" className="mt-10 inline-block">
          <Button size="lg">Criar minha loja</Button>
        </Link>
      </main>
      <Footer />
    </div>
  );
}
