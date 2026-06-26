"use client";

import { useState } from "react";
import { FileText, Copy, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

const TERMOS_DE_USO = `Termos de Uso - ConectaParts

1. DO OBJETO
A ConectaParts atua exclusivamente como uma plataforma de tecnologia (SaaS) e vitrine digital para lojas de autopeças. O nosso objetivo é fornecer um ambiente para que lojistas e clientes se conectem.

2. ISENÇÃO DE RESPONSABILIDADE
A ConectaParts NÃO comercializa peças, não realiza entregas, não é proprietária dos produtos oferecidos pelas lojas parceiras e não tem responsabilidade sobre a logística.
Qualquer problema relacionado a defeitos de fabricação, garantia, entrega, logística ou estorno de pagamentos deve ser tratado diretamente entre o Cliente e a Loja de Autopeças (Lojista). A ConectaParts está integralmente isenta de responsabilidade sobre a relação de consumo.

3. USO DA PLATAFORMA
O lojista é inteiramente responsável pela veracidade dos dados dos produtos, descrições, preços e disponibilidade. A plataforma não audita estoques de lojistas.

4. PAGAMENTOS
O processamento de pagamentos pode ocorrer através de provedores terceirizados (gateways de pagamento). A ConectaParts não retém valores de produtos e não se responsabiliza por falhas sistêmicas da operadora de cartão ou banco.`;

const POLITICA_PRIVACIDADE = `Política de Privacidade - ConectaParts

1. COLETA DE DADOS
Coletamos os dados estritamente necessários para o funcionamento da plataforma, como nome, email, telefone e histórico de compras, com o objetivo de otimizar a experiência do usuário.

2. USO E COMPARTILHAMENTO
Os dados do cliente são compartilhados EXCLUSIVAMENTE com o Lojista do qual o cliente realizou uma cotação ou compra, para fins de logística e comunicação. A ConectaParts não vende, aluga ou cede dados pessoais a terceiros não envolvidos na transação.

3. SEGURANÇA
Empregamos as melhores práticas de segurança da informação, como criptografia de ponta a ponta para senhas e tokens. Não armazenamos números de cartão de crédito.

4. DIREITOS DO USUÁRIO
Conforme a LGPD, o usuário tem direito de solicitar a exclusão de sua conta e anonimização de seus dados a qualquer momento pelo painel de controle.`;

export default function AdminJuridicoPage() {
  const [copiedTermos, setCopiedTermos] = useState(false);
  const [copiedPrivacidade, setCopiedPrivacidade] = useState(false);

  const handleCopy = (text: string, type: "termos" | "privacidade") => {
    navigator.clipboard.writeText(text);
    if (type === "termos") {
      setCopiedTermos(true);
      setTimeout(() => setCopiedTermos(false), 2000);
    } else {
      setCopiedPrivacidade(true);
      setTimeout(() => setCopiedPrivacidade(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-black text-foreground flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-amber-500" /> Documentos Legais
        </h1>
        <p className="text-muted-foreground">
          Estes são os textos oficiais exigidos para os usuários no momento do cadastro. Eles protegem a plataforma e garantem a isenção de responsabilidade.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TERMOS DE USO */}
        <div className="rounded-2xl border border-border-subtle bg-panel/50 p-6 flex flex-col h-full shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-400" /> Termos de Uso
            </h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-foreground border-zinc-700"
              onClick={() => handleCopy(TERMOS_DE_USO, "termos")}
            >
              {copiedTermos ? (
                <><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Copiado</>
              ) : (
                <><Copy className="h-4 w-4" /> Copiar Texto</>
              )}
            </Button>
          </div>
          <div className="flex-1 bg-background/50 rounded-xl p-4 border border-zinc-800 font-mono text-sm text-foreground/80 whitespace-pre-wrap overflow-y-auto max-h-[500px]">
            {TERMOS_DE_USO}
          </div>
        </div>

        {/* POLITICA DE PRIVACIDADE */}
        <div className="rounded-2xl border border-border-subtle bg-panel/50 p-6 flex flex-col h-full shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-400" /> Política de Privacidade
            </h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-foreground border-zinc-700"
              onClick={() => handleCopy(POLITICA_PRIVACIDADE, "privacidade")}
            >
              {copiedPrivacidade ? (
                <><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Copiado</>
              ) : (
                <><Copy className="h-4 w-4" /> Copiar Texto</>
              )}
            </Button>
          </div>
          <div className="flex-1 bg-background/50 rounded-xl p-4 border border-zinc-800 font-mono text-sm text-foreground/80 whitespace-pre-wrap overflow-y-auto max-h-[500px]">
            {POLITICA_PRIVACIDADE}
          </div>
        </div>
      </div>
    </div>
  );
}
