"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Store, 
  Users, 
  AlertTriangle,
  Loader2,
  DollarSign,
  Radio,
  Download
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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

interface AdminMetrics {
  mrr: number;
  totalStores: number;
  activeStores: number;
  suspendedStores: number;
  totalCustomers: number;
  recentStores: {
    id: string;
    name: string;
    createdAt: string;
    active: boolean;
    owner: { name: string; email: string };
  }[];
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch("/api/admin/metrics");
        if (!res.ok) throw new Error("Falha ao carregar métricas");
        const data = await res.json();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-3">
        <AlertTriangle className="h-6 w-6" />
        <p className="font-bold">{error || "Erro desconhecido ao carregar painel."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-foreground">Visão Geral</h1>
          <p className="text-muted-foreground mt-1">Bem-vindo ao centro de controle da Agury.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground font-bold px-4 py-2 rounded-lg transition-colors border border-border-subtle" onClick={() => alert('Feature Export CSV disparada.')}>
            <Download className="h-4 w-4" /> Exportar Dados (CSV)
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-lg" onClick={() => alert('Modal de Broadcast Global aberto.')}>
            <Radio className="h-4 w-4" /> Enviar Aviso em Massa
          </button>
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* MRR Card */}
        <motion.div variants={item} className="bg-zinc-100 dark:bg-panel border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-24 h-24 text-emerald-500 -mr-6 -mt-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-2">MRR Atual</p>
            <h2 className="text-4xl font-black text-foreground">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(metrics.mrr)}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Faturamento recorrente
            </p>
          </div>
        </motion.div>

        {/* Total Lojas */}
        <motion.div variants={item} className="bg-zinc-100 dark:bg-panel border border-zinc-200 dark:border-border-subtle rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Store className="w-24 h-24 text-foreground -mr-6 -mt-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Lojas Ativas</p>
            <h2 className="text-4xl font-black text-foreground">{metrics.activeStores}</h2>
            <p className="text-sm text-muted-foreground mt-2">
              De {metrics.totalStores} cadastradas ({metrics.suspendedStores} suspensas)
            </p>
          </div>
        </motion.div>

        {/* Clientes */}
        <motion.div variants={item} className="bg-zinc-100 dark:bg-panel border border-zinc-200 dark:border-border-subtle rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-24 h-24 text-foreground -mr-6 -mt-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Clientes Finais</p>
            <h2 className="text-4xl font-black text-foreground">{metrics.totalCustomers}</h2>
            <p className="text-sm text-muted-foreground mt-2">Usuários compradores</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Lojas Recentes */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-zinc-100 dark:bg-panel border border-zinc-200 dark:border-border-subtle rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-border-subtle flex items-center justify-between">
          <h3 className="font-bold text-foreground text-lg">Lojas Cadastradas Recentemente</h3>
          <Link href="/admin/lojas" className="text-sm font-bold text-emerald-500 hover:text-emerald-400">
            Ver Todas →
          </Link>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-border-subtle">
          {metrics.recentStores.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Nenhuma loja cadastrada ainda.</div>
          ) : (
            metrics.recentStores.map((store) => (
              <div key={store.id} className="p-6 flex items-center justify-between hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-border-subtle shadow-sm">
                    <Store className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg">{store.name}</p>
                    <p className="text-sm text-muted-foreground">{store.owner.name} ({store.owner.email})</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    store.active 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {store.active ? "Ativa" : "Suspensa"}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {new Date(store.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
