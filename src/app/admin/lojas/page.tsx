"use client";

import { useEffect, useState } from "react";
import { 
  Store, 
  Loader2,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface StoreAdmin {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  active: boolean;
  owner: { name: string; email: string };
  subscription: {
    plan: { name: string; priceMonthly: number };
    status: string;
  } | null;
}

export default function AdminLojasPage() {
  const [stores, setStores] = useState<StoreAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadStores() {
    try {
      const res = await fetch("/api/admin/stores");
      if (!res.ok) throw new Error("Falha ao carregar lojas");
      const data = await res.json();
      setStores(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStores();
  }, []);

  async function toggleStoreActive(id: string, currentActive: boolean) {
    if (!confirm(`Deseja realmente ${currentActive ? "suspender" : "ativar"} esta loja?`)) return;
    
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/stores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar");
      
      // Atualiza o state localmente
      setStores(prev => prev.map(s => s.id === id ? { ...s, active: !currentActive } : s));
    } catch (err) {
      alert("Erro ao mudar status da loja.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredStores = stores.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-display font-black text-foreground">Gestão de Lojas</h1>
          <p className="text-muted-foreground mt-1">Aprove, suspenda e veja os detalhes dos tenants.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-panel border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-panel border border-border-subtle rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-background/50 text-xs uppercase text-muted-foreground border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4 font-bold">Loja</th>
                <th className="px-6 py-4 font-bold">Dono</th>
                <th className="px-6 py-4 font-bold">Plano</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredStores.map((store) => (
                <tr key={store.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 border border-border-subtle">
                        <Store className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-base">{store.name}</p>
                        <Link href={`/loja/${store.slug}`} target="_blank" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-0.5 w-fit">
                          /loja/{store.slug} <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground/80">{store.owner.name}</p>
                    <p className="text-xs text-muted-foreground">{store.owner.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    {store.subscription ? (
                      <>
                        <p className="font-bold text-foreground/80">{store.subscription.plan.name}</p>
                        <p className={`text-xs font-bold mt-0.5 ${store.subscription.status === 'ACTIVE' ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {store.subscription.status}
                        </p>
                      </>
                    ) : (
                      <span className="text-zinc-600">Sem Assinatura</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      store.active 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                      {store.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {store.active ? "Ativa" : "Suspensa"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <Link href={\`/admin/lojas/\${store.id}\`}>
                      <Button className="h-8 px-4 text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white">
                        Modo Deus
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => toggleStoreActive(store.id, store.active)}
                      disabled={updatingId === store.id}
                      className={\`h-8 px-4 text-xs font-bold \${
                        store.active 
                          ? "bg-red-600 hover:bg-red-500 text-white" 
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }\`}
                    >
                      {updatingId === store.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        store.active ? "Suspender" : "Aprovar"
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredStores.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Nenhuma loja encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
