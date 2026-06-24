import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { Stats } from "@/components/ui/Stats";
import { Users, DollarSign, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";

export default async function ContaAfiliadoPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.userId },
    include: { _count: { select: { referrals: true } } }
  });

  if (!affiliate) {
    return (
      <div className="space-y-6 animate-fade-in text-center py-12 max-w-lg mx-auto">
        <h1 className="font-display text-2xl font-bold text-white">Programa de Afiliados</h1>
        <p className="text-zinc-400 mb-8">Ganhe comissões indicando novas lojas para a plataforma Agury. Torne-se um parceiro hoje mesmo.</p>
        <Button size="lg" className="w-full">Quero ser Afiliado</Button>
      </div>
    );
  }

  if (affiliate.status === "PENDING") {
    return (
      <div className="space-y-6 animate-fade-in text-center py-12 max-w-lg mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-400/10 mb-6">
          <CheckCircle2 className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white">Solicitação em Análise</h1>
        <p className="text-zinc-400">Sua solicitação para se tornar afiliado está sendo analisada pela nossa equipe. Em breve você receberá uma resposta.</p>
      </div>
    );
  }

  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}?ref=${affiliate.code}`;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Painel de Afiliado</h1>
        <p className="text-zinc-400">Acompanhe suas indicações e ganhos</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stats 
          label="Ganhos Totais" 
          value={formatCurrency(affiliate.totalEarnings)} 
          icon={DollarSign} 
        />
        <Stats 
          label="Indicações" 
          value={affiliate._count.referrals} 
          icon={Users} 
        />
        <Stats 
          label="Cliques no Link" 
          value={affiliate.totalClicks} 
          icon={LinkIcon} 
        />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="font-display font-bold text-white mb-2">Seu Link de Indicação</h2>
        <p className="text-sm text-zinc-400 mb-4">Compartilhe este link. Você ganha {affiliate.commissionRate}% de comissão na primeira mensalidade das lojas indicadas.</p>
        
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 font-mono text-sm text-amber-400 overflow-x-auto">
            {referralLink}
          </div>
          <Button variant="outline">Copiar</Button>
        </div>
      </div>
    </div>
  );
}
