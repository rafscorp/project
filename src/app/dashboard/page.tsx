import { Package, Star, TrendingUp, Users } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { StoreService } from "@/services/store.service";
import { redirect } from "next/navigation";

export default async function DashboardOverview() {
  const session = await getSession();
  if (!session || !session.storeId) redirect("/login");

  const store = await StoreService.getById(session.storeId);
  if (!store) redirect("/login");

  if (StoreService.getFomoStatus(store) === "HARD_LOCK") {
    redirect("/dashboard/pagamento");
  }
  const stats = [
    { title: "Peças Cadastradas", value: "24", icon: Package, trend: "+3 esta semana" },
    { title: "Visitas na Vitrine", value: "1.204", icon: Users, trend: "+12% vs mês anterior" },
    { title: "Média de Avaliações", value: "4.8", icon: Star, trend: "Baseado em 12 reviews" },
    { title: "Desempenho", value: "Alto", icon: TrendingUp, trend: "Sua loja está no Top 5" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-black text-white">Visão Geral</h1>
        <p className="text-zinc-400 mt-1">Acompanhe as métricas do seu negócio na Agury.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 bg-zinc-900/40">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-zinc-800 rounded-xl border border-white/5">
                <stat.icon className="h-6 w-6 text-violet-400" />
              </div>
            </div>
            <p className="text-zinc-400 font-medium mb-1">{stat.title}</p>
            <h3 className="text-3xl font-black text-white mb-2">{stat.value}</h3>
            <p className="text-sm font-medium text-emerald-400">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 bg-zinc-900/40 min-h-[400px] flex flex-col items-center justify-center text-center">
          <TrendingUp className="h-12 w-12 text-zinc-700 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Gráfico de Visitas</h3>
          <p className="text-zinc-500">Integração com painel de métricas em desenvolvimento.</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-zinc-900/40 min-h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6">Últimas Atividades</h3>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-violet-500 shrink-0" />
                <div>
                  <p className="text-zinc-300 font-medium text-sm">Nova avaliação recebida</p>
                  <p className="text-zinc-500 text-xs mt-1">Há {i} hora{i > 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
