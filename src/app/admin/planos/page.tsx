"use client";

import { useEffect, useState } from "react";
import { 
  CreditCard, 
  Loader2,
  AlertTriangle,
  Plus,
  CheckCircle2,
  XCircle,
  Users,
  Package,
  Store
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PlanAdmin {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  maxProducts: number;
  maxStaff: number;
  maxProducts: number;
  maxStaff: number;
  active: boolean;
  comparePriceMonthly: number | null;
  _count: {
    subscriptions: number;
  };
}

export default function AdminPlanosPage() {
  const [plans, setPlans] = useState<PlanAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [showForm, setShowForm] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [discountData, setDiscountData] = useState({
    percentage: "",
    filter: "all_active"
  });

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    priceMonthly: "",
    comparePriceMonthly: "",
    maxProducts: "",
    maxStaff: ""
  });

  async function loadPlans() {
    try {
      const res = await fetch("/api/admin/plans");
      if (!res.ok) throw new Error("Falha ao carregar planos");
      const data = await res.json();
      setPlans(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erro ao criar");
      }
      
      await loadPlans();
      setShowForm(false);
      setFormData({ name: "", slug: "", priceMonthly: "", comparePriceMonthly: "", maxProducts: "", maxStaff: "" });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function togglePlanActive(id: string, currentActive: boolean) {
    if (!confirm(`Deseja realmente ${currentActive ? "arquivar" : "ativar"} este plano? Planos arquivados não podem ser assinados por novas lojas, mas assinaturas antigas continuam válidas.`)) return;
    
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/plans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar");
      
      setPlans(prev => prev.map(p => p.id === id ? { ...p, active: !currentActive } : p));
    } catch (err) {
      alert("Erro ao mudar status do plano.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-3">
        <AlertTriangle className="h-6 w-6" />
        <p className="font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-foreground">Planos Financeiros</h1>
          <p className="text-muted-foreground mt-1">Gerencie os pacotes que as lojas assinam para usar a plataforma.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => { setShowDiscountForm(!showDiscountForm); setShowForm(false); }} variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 font-bold h-12 px-6">
            Descontos Específicos
          </Button>
          <Button onClick={() => { setShowForm(!showForm); setShowDiscountForm(false); }} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 px-6">
            <Plus className="w-5 h-5 mr-2" /> Novo Plano
          </Button>
        </div>
      </div>

      {showDiscountForm && (
        <form onSubmit={(e) => { e.preventDefault(); alert("Filtro inteligente aplicado em massa no backend (Em desenvolvimento)"); setShowDiscountForm(false); }} className="bg-panel border border-amber-500/30 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-amber-500/20 rounded-full">
              <span className="text-amber-500 font-black text-lg">%</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">Desconto em Massa (Filtros Inteligentes)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-muted-foreground block mb-1">Porcentagem de Desconto</label>
              <input required type="number" min="1" max="100" value={discountData.percentage} onChange={e => setDiscountData(d => ({ ...d, percentage: e.target.value }))} className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2 text-foreground" placeholder="Ex: 20 (para 20%)" />
            </div>
            <div>
              <label className="text-sm font-bold text-muted-foreground block mb-1">Filtro Inteligente (Alvo)</label>
              <select value={discountData.filter} onChange={e => setDiscountData(d => ({ ...d, filter: e.target.value }))} className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2 text-foreground">
                <option value="all_active">Todas as Lojas Ativas</option>
                <option value="older_than_6m">Lojas fiéis (+ de 6 meses)</option>
                <option value="most_interactions">Lojas com mais interações/chats</option>
                <option value="inactive">Lojas inativas (Tentar reter)</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-2">O desconto será aplicado diretamente no valor renovado da assinatura da loja (campo discountPercentage no banco de dados).</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button type="button" onClick={() => setShowDiscountForm(false)} className="bg-transparent hover:bg-white/5 text-muted-foreground">Cancelar</Button>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black font-bold">
              Aplicar Desconto em Massa
            </Button>
          </div>
        </form>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-panel border border-emerald-500/30 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-bold text-foreground mb-4">Criar Novo Plano</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-muted-foreground block mb-1">Nome do Plano</label>
              <input required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2 text-foreground" placeholder="Ex: Starter" />
            </div>
            <div>
              <label className="text-sm font-bold text-muted-foreground block mb-1">Slug (Identificador único)</label>
              <input required value={formData.slug} onChange={e => setFormData(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2 text-foreground" placeholder="ex: starter-plan" />
            </div>
            <div>
              <label className="text-sm font-bold text-muted-foreground block mb-1">Preço Atual (R$)</label>
              <input required type="number" step="0.01" value={formData.priceMonthly} onChange={e => setFormData(p => ({ ...p, priceMonthly: e.target.value }))} className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2 text-foreground" placeholder="79.90" />
            </div>
            <div>
              <label className="text-sm font-bold text-muted-foreground block mb-1">Preço Antigo (Opcional - R$)</label>
              <input type="number" step="0.01" value={formData.comparePriceMonthly} onChange={e => setFormData(p => ({ ...p, comparePriceMonthly: e.target.value }))} className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2 text-foreground" placeholder="99.90" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-muted-foreground block mb-1">Limite Peças</label>
                <input required type="number" value={formData.maxProducts} onChange={e => setFormData(p => ({ ...p, maxProducts: e.target.value }))} className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2 text-foreground" placeholder="100" />
              </div>
              <div>
                <label className="text-sm font-bold text-muted-foreground block mb-1">Limite Vendedores</label>
                <input required type="number" value={formData.maxStaff} onChange={e => setFormData(p => ({ ...p, maxStaff: e.target.value }))} className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2 text-foreground" placeholder="3" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button type="button" onClick={() => setShowForm(false)} className="bg-transparent hover:bg-white/5 text-muted-foreground">Cancelar</Button>
            <Button type="submit" disabled={creating} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
              {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Plano"}
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-panel border rounded-2xl p-6 relative flex flex-col ${
            plan.active ? "border-emerald-500/20" : "border-border-subtle opacity-70"
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-xs font-mono text-muted-foreground">{plan.slug}</p>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                plan.active ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-muted-foreground"
              }`}>
                {plan.active ? "Ativo" : "Arquivado"}
              </div>
            </div>
            
            <div className="mb-6 flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-black text-foreground">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(plan.priceMonthly)}
              </span>
              <span className="text-sm text-muted-foreground"> / mês</span>
              {plan.comparePriceMonthly && plan.comparePriceMonthly > plan.priceMonthly && (
                <div className="w-full flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-muted-foreground line-through">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(plan.comparePriceMonthly)}
                  </span>
                  <span className="text-xs font-black text-black bg-amber-400 px-2 py-0.5 rounded-md">
                    -{Math.round(((plan.comparePriceMonthly - plan.priceMonthly) / plan.comparePriceMonthly) * 100)}%
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <Package className="w-4 h-4 text-emerald-400" /> Até {plan.maxProducts} peças no catálogo
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <Users className="w-4 h-4 text-emerald-400" /> Até {plan.maxStaff} vendedores
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <Store className="w-4 h-4 text-emerald-400" /> {plan._count.subscriptions} Lojas usando (Ativas)
              </div>
            </div>

            <Button 
              onClick={() => togglePlanActive(plan.id, plan.active)}
              disabled={updatingId === plan.id}
              className={`w-full h-10 text-sm font-bold ${
                plan.active 
                  ? "bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-muted-foreground" 
                  : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400"
              }`}
            >
              {updatingId === plan.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                plan.active ? "Arquivar Plano" : "Reativar Plano"
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
