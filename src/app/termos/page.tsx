import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermosPage() {
  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-24 sm:px-6 prose prose-invert">
        <h1 className="font-display text-3xl font-bold text-white">Termos de Uso</h1>
        <div className="mt-8 space-y-6 text-zinc-400">
          <p>A Agury Auto é uma plataforma SaaS B2B. Empresas contratam assinatura mensal para operar lojas online.</p>
          <p>Transações entre clientes finais e lojas são de responsabilidade das partes. A plataforma intermedia a tecnologia, não a venda direta.</p>
          <p>Retirada de produtos é exclusivamente na loja física cadastrada. Não há serviço de entrega.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
