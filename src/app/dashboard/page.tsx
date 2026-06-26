import { Package, Star, TrendingUp, Users, DollarSign, Target, Activity } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { StoreService } from "@/services/store.service";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { DashboardCharts } from "./DashboardCharts";
import { MotionDiv } from "@/components/MotionWrapper";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default async function DashboardOverview() {
  const session = await getSession();
  if (!session || !session.storeId) redirect("/login");

  const store = await StoreService.getById(session.storeId);
  if (!store) redirect("/login");

  if (StoreService.getFomoStatus(store) === "HARD_LOCK") {
    redirect("/dashboard/pagamento");
  }

  // 1. Número de Produtos Cadastrados
  const productsCount = await prisma.product.count({
    where: { storeId: session.storeId, deletedAt: null },
  });

  // 2. Orçamentos para calcular Vendas, Ticket Médio e Taxa de Conversão
  const quotes = await prisma.quoteRequest.findMany({
    where: { storeId: session.storeId },
    select: { status: true, priceOffer: true, createdAt: true },
    orderBy: { createdAt: "asc" }
  });

  const totalQuotes = quotes.length;
  const acceptedQuotes = quotes.filter(q => q.status === "ACCEPTED");
  
  // Taxa de conversão (% de orçamentos que viraram vendas)
  const conversionRate = totalQuotes > 0 ? (acceptedQuotes.length / totalQuotes) * 100 : 0;
  
  // Vendas Totais
  const totalSales = acceptedQuotes.reduce((acc, q) => acc + (q.priceOffer || 0), 0);
  
  // Ticket Médio
  const averageTicket = acceptedQuotes.length > 0 ? totalSales / acceptedQuotes.length : 0;

  // Gerar dados para o Gráfico (Agrupado por dia/mês simplificado)
  // Como é MVP, vamos agrupar os últimos 7 dias.
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const salesData = last7Days.map(date => {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    
    const daySales = acceptedQuotes
      .filter(q => q.createdAt >= date && q.createdAt < nextDay)
      .reduce((acc, q) => acc + (q.priceOffer || 0), 0);
      
    return {
      name: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      total: daySales
    };
  });

  // Últimas atividades (Últimos 3 chats/pedidos com movimento)
  const recentActivities = await prisma.quoteMessage.findMany({
    where: { quoteRequest: { storeId: session.storeId } },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { quoteRequest: { include: { customer: true } } }
  });

  const stats = [
    { title: "Vendas Totais", value: `R$ ${totalSales.toFixed(2)}`, icon: DollarSign, trend: `${acceptedQuotes.length} pedidos fechados` },
    { title: "Ticket Médio", value: `R$ ${averageTicket.toFixed(2)}`, icon: TrendingUp, trend: "Por venda confirmada" },
    { title: "Taxa de Conversão", value: `${conversionRate.toFixed(1)}%`, icon: Target, trend: `${totalQuotes} orçamentos totais` },
    { title: "Peças Cadastradas", value: productsCount.toString(), icon: Package, trend: "No seu catálogo digital" },
  ];

  return (
    <div className="space-y-8">
      <MotionDiv initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-display font-black text-foreground">Dashboard Financeiro</h1>
        <p className="text-muted-foreground mt-1">Acompanhe suas vendas, conversão e métricas da loja.</p>
      </MotionDiv>

      <MotionDiv 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {stats.map((stat, i) => (
          <MotionDiv variants={item} key={i} className="glass-panel p-6 rounded-2xl border border-zinc-200 dark:border-border-subtle bg-zinc-100 dark:bg-panel/40 hover:bg-zinc-200 dark:hover:bg-zinc-800/40 transition-all hover:scale-[1.02]">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-border-subtle shadow-sm">
                <stat.icon className={`h-6 w-6 ${i === 0 ? 'text-emerald-500' : i === 1 ? 'text-blue-500' : i === 2 ? 'text-amber-500' : 'text-violet-500'}`} />
              </div>
            </div>
            <p className="text-muted-foreground font-medium mb-1">{stat.title}</p>
            <h3 className="text-3xl font-black text-foreground mb-2">{stat.value}</h3>
            <p className="text-sm font-medium text-muted-foreground">{stat.trend}</p>
          </MotionDiv>
        ))}
      </MotionDiv>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-zinc-200 dark:border-border-subtle bg-zinc-100 dark:bg-panel/40 min-h-[400px] flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">Faturamento (Últimos 7 dias)</h3>
            <span className="text-xs font-bold bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">Ao Vivo</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <DashboardCharts salesData={salesData} />
          </div>
        </MotionDiv>
        
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-panel p-6 rounded-2xl border border-zinc-200 dark:border-border-subtle bg-zinc-100 dark:bg-panel/40 min-h-[400px]"
        >
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center"><Activity className="w-5 h-5 mr-2 text-muted-foreground"/> Últimas Atividades</h3>
          <div className="space-y-6">
            {recentActivities.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma atividade recente.</p>
            ) : (
              recentActivities.map((activity, i) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <p className="text-foreground/80 font-medium text-sm">
                      Nova mensagem de <strong>{activity.quoteRequest.customer.name}</strong>
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Peça: {activity.quoteRequest.part}
                    </p>
                    <p className="text-zinc-600 text-xs mt-1">
                      {new Date(activity.createdAt).toLocaleDateString('pt-BR')} às {new Date(activity.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </MotionDiv>
      </div>
    </div>
  );
}
