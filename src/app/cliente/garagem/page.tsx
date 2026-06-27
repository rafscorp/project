"use client";
import { useState, useEffect } from "react";
import { CarFront, Search, Trash2, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { PlacaCreditBanner } from "@/components/app/PlacaCreditBanner";

export default function GaragemVirtual() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [placaInput, setPlacaInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [creditStatus, setCreditStatus] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehRes, credRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/placa-plans/credits/status")
      ]);
      
      if (vehRes.ok) {
        const data = await vehRes.json();
        setVehicles(data);
      }
      
      if (credRes.ok) {
        const cred = await credRes.json();
        setCreditStatus(cred);
      }
    } catch (err) {
      console.error("Error loading garage:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placaInput || placaInput.length < 7) {
      setError("Digite uma placa válida com 7 caracteres.");
      return;
    }

    if (creditStatus && !creditStatus.allowed) {
      setError("Você não tem créditos suficientes. Compre um pacote de consultas.");
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      const cleanPlaca = placaInput.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      
      // 1. Busca na API de placas
      const res = await fetch(`/api/veiculos/placa/${cleanPlaca}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Veículo não encontrado");
      }

      // Se sucesso, debita da UI otimisticamente
      if (creditStatus && creditStatus.allowed) {
         loadData(); // Recarrega status dos créditos
      }

      // 2. Salva na garagem
      const saveRes = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!saveRes.ok) {
        const saveData = await saveRes.json();
        // Pode ser que já exista
        if (saveRes.status !== 409) {
           throw new Error(saveData.error || "Erro ao salvar na garagem");
        }
      }

      setPlacaInput("");
      loadData(); // Recarrega lista
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col p-4 sm:p-8">
      <div className="fixed inset-0 z-0 bg-mesh-dark pointer-events-none" />
      <div className="max-w-5xl mx-auto w-full relative z-10">
        
        <Link href="/cliente/home" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Painel
        </Link>

        <h1 className="text-4xl font-display font-black text-foreground mb-2">Minha Garagem</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Adicione seus veículos e consulte peças específicas com facilidade.
        </p>

        <PlacaCreditBanner creditStatus={creditStatus} onRefreshCredits={loadData} />

        {/* Busca Box */}
        <div className="glass-panel p-6 rounded-3xl border border-border-subtle bg-panel/60 mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4">Adicionar Veículo</h2>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <CarFront className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                value={placaInput}
                onChange={(e) => setPlacaInput(e.target.value.toUpperCase())}
                placeholder="Placa do veículo (ex: ABC1D23)" 
                className="w-full bg-zinc-900/50 border border-border-subtle text-foreground placeholder:text-zinc-600 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                maxLength={8}
              />
            </div>
            <button 
              type="submit" 
              disabled={isSearching || (!creditStatus?.allowed)}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold px-8 py-4 rounded-xl transition-colors flex items-center justify-center min-w-[160px]"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buscar Placa"}
            </button>
          </form>
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* Grade de Veículos */}
        <h2 className="text-2xl font-bold text-foreground mb-6">Veículos Salvos ({vehicles.length})</h2>
        {vehicles.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-border-subtle text-center">
            <CarFront className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-400 mb-2">Garagem vazia</h3>
            <p className="text-zinc-600">Busque pela placa do seu veículo acima para adicioná-lo à sua garagem virtual.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((v) => (
              <div key={v.id} className="glass-panel p-6 rounded-3xl border border-border-subtle bg-panel/40 relative group">
                <div className="absolute top-6 right-6 px-3 py-1 bg-zinc-800 border border-border-subtle rounded-lg font-mono font-bold text-sm tracking-widest text-zinc-300">
                  {v.placa}
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-1 pr-24">{v.marca} {v.modelo}</h3>
                <p className="text-blue-400 font-medium mb-6">{v.ano} • {v.cor}</p>
                
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border-subtle">
                  <div>
                    <span className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Chassi</span>
                    <span className="font-mono text-sm text-foreground bg-zinc-900 px-2 py-1 rounded border border-border-subtle">{v.chassi}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Motor</span>
                    <span className="font-mono text-sm text-foreground bg-zinc-900 px-2 py-1 rounded border border-border-subtle">{v.motor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
