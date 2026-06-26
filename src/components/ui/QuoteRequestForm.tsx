"use client";

import { useState, useEffect } from "react";
import {
  Search, Loader2, Car, AlertCircle, Send, CheckCircle2,
  PenLine, ChevronRight, ShieldCheck, Database, X,
} from "lucide-react";
import { VehicleSelectCard, VehicleData } from "@/components/ui/VehicleSelectCard";
import { PrivacyBanner } from "@/components/ui/PrivacyBanner";
import { Button } from "@/components/ui/Button";

// =============================================================================
// QuoteRequestForm.tsx — v2
//
// Dois modos de seleção de veículo:
//  1. Por Placa (API) — checa garagem local antes de gastar crédito na API
//  2. Manual        — Marca/Modelo/Cor/Ano obrigatórios, resto opcional
//                     Opção de salvar ou não na Garagem Virtual
// =============================================================================

interface QuoteRequestFormProps {
  storeId: string;
  storeName: string;
}

type InputMode = "placa" | "manual";
type FormStep  = "loading" | "ready" | "submitting" | "success";

interface ManualVehicle {
  marca: string;
  modelo: string;
  cor: string;
  ano: string;
  combustivel: string;
  versao: string;
  cidade: string;
}

const EMPTY_MANUAL: ManualVehicle = {
  marca: "", modelo: "", cor: "", ano: "",
  combustivel: "", versao: "", cidade: "",
};

export function QuoteRequestForm({ storeId, storeName }: QuoteRequestFormProps) {
  // ── Estado global ──────────────────────────────────────────────────────────
  const [formStep, setFormStep] = useState<FormStep>("loading");
  const [inputMode, setInputMode] = useState<InputMode>("placa");
  const [problem, setProblem] = useState("");
  const MAX_CHARS = 1000;

  // ── Garagem: veículos salvos ───────────────────────────────────────────────
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // ── Modo Placa ─────────────────────────────────────────────────────────────
  const [searchPlaca, setSearchPlaca] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [foundVehicle, setFoundVehicle] = useState<VehicleData | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [plateConfirmed, setPlateConfirmed] = useState<boolean | null>(null);
  const [isEditingPlate, setIsEditingPlate] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState<VehicleData | null>(null);
  const [placaApiAvailable, setPlacaApiAvailable] = useState(true);

  // ── Modo Manual ────────────────────────────────────────────────────────────
  const [manual, setManual] = useState<ManualVehicle>(EMPTY_MANUAL);
  const [wantToSave, setWantToSave] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [manualSaved, setManualSaved] = useState(false);

  // ── Erros ─────────────────────────────────────────────────────────────────
  const [submitError, setSubmitError] = useState("");

  // ── Carrega garagem e status da API ────────────────────────────────────────
  useEffect(() => {
    async function init() {
      // 1. Carrega status da API
      try {
        const statusRes = await fetch("/api/veiculos/placa-status");
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setPlacaApiAvailable(statusData.available);
          if (!statusData.available) {
            setSearchError("Função de pesquisa por placas indisponível");
          }
        }
      } catch {
        setPlacaApiAvailable(true);
      }

      // 2. Carrega garagem
      try {
        const res = await fetch("/api/vehicles");
        if (res.ok) {
          const data: VehicleData[] = await res.json();
          setVehicles(data);
          if (data.length > 0) setSelectedVehicleId(data[0].id);
        }
      } catch { /* falha silenciosa */ }
      finally { setFormStep("ready"); }
    }
    init();
  }, []);

  // ── Resetar seleção ao trocar de modo ─────────────────────────────────────
  function switchMode(mode: InputMode) {
    setInputMode(mode);
    setFoundVehicle(null);
    setSearchPlaca("");
    setSearchError("");
    setJustSaved(false);
    setManual(EMPTY_MANUAL);
    setWantToSave(false);
    setManualSaved(false);
    setSubmitError("");
    setPlateConfirmed(null);
    setIsEditingPlate(false);
    setEditedVehicle(null);
    // Mantém seleção da garagem somente no modo placa
    if (mode === "manual") setSelectedVehicleId(null);
    else if (vehicles.length > 0) setSelectedVehicleId(vehicles[0].id);
  }

  // ── Busca por placa ────────────────────────────────────────────────────────
  async function handleSearchPlaca(placaInput?: any) {
    const clean = (typeof placaInput === 'string' ? placaInput : searchPlaca).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    if (clean.length !== 7) {
      setSearchError("Placa deve ter 7 caracteres (ex: ABC1234 ou BRA2E19).");
      return;
    }

    setSearchError("");
    setFoundVehicle(null);
    setJustSaved(false);
    setPlateConfirmed(null);
    setIsEditingPlate(false);
    setEditedVehicle(null);

    // ✅ REGRA: Se já existe esta placa na garagem → usa cache local, NÃO chama a API
    const cached = vehicles.find((v) => v.placa === clean);
    if (cached) {
      setSelectedVehicleId(cached.id);
      setFoundVehicle(cached);
      return; // Sem custo de API
    }

    // Placa nova → chama API
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/veiculos/placa/${clean}`);
      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.error || "Veículo não encontrado.");
        return;
      }

      const v: VehicleData = {
        id: `temp-${clean}`,
        placa: clean,
        marca: data.marca,
        modelo: data.modelo,
        ano: data.ano,
        cor: data.cor,
        combustivel: data.combustivel,
        versao: data.versao,
      };

      setFoundVehicle(v);
      setSelectedVehicleId(v.id);

      // Auto-save silencioso (garagem) — só se for placa nova
      const saved = await autoSaveVehicle(data);
      if (saved) {
        setJustSaved(true);
        setFoundVehicle((prev) => prev ? { ...prev, id: saved.id } : prev);
        setSelectedVehicleId(saved.id);
        // Atualiza lista da garagem
        const gRes = await fetch("/api/vehicles");
        if (gRes.ok) setVehicles(await gRes.json());
      }
    } catch {
      setSearchError("Erro ao consultar placa. Tente novamente.");
    } finally {
      setSearchLoading(false);
    }
  }

  async function autoSaveVehicle(data: any): Promise<{ id: string } | null> {
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placa: data.placa,
          marca: data.marca,
          modelo: data.modelo,
          ano: data.ano,
          cor: data.cor,
          combustivel: data.combustivel || "—",
          versao: data.versao || "—",
          chassi: data.chassi || "—",
          motor: data.motor || "—",
          ownerName: "—",
        }),
      });
      if (res.ok) return await res.json();
    } catch { /* silencioso */ }
    return null;
  }

  // ── Salvar veículo manual na garagem ──────────────────────────────────────
  async function saveManualVehicle(): Promise<string | null> {
    setIsSavingManual(true);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placa: `MANUAL-${Date.now()}`, // placa virtual única para manuais
          marca: manual.marca,
          modelo: manual.modelo,
          ano: manual.ano,
          cor: manual.cor,
          combustivel: manual.combustivel || "—",
          versao: manual.versao || "—",
          cidade: manual.cidade || "—",
          chassi: "—",
          motor: "—",
          ownerName: "—",
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        const gRes = await fetch("/api/vehicles");
        if (gRes.ok) setVehicles(await gRes.json());
        return saved.id;
      }
    } catch { /* silencioso */ }
    finally { setIsSavingManual(false); }
    return null;
  }

  // ── Submissão do orçamento ─────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    // Validação do veículo selecionado
    let vehicleLabel = "";

    if (inputMode === "placa") {
      const v = vehicles.find((v) => v.id === selectedVehicleId)
        ?? (foundVehicle?.id === selectedVehicleId ? foundVehicle : null);
      if (!v) {
        setSubmitError("Selecione ou busque um veículo para continuar.");
        return;
      }
      vehicleLabel = `${v.placa} — ${v.marca} ${v.modelo} ${v.ano}`;

    } else {
      // Modo manual: valida obrigatórios
      if (!manual.marca.trim() || !manual.modelo.trim() || !manual.cor.trim() || !manual.ano.trim()) {
        setSubmitError("Preencha Marca, Modelo, Cor e Ano para continuar.");
        return;
      }

      vehicleLabel = `${manual.marca} ${manual.modelo} ${manual.ano} — ${manual.cor}`;

      // Salva na garagem se o usuário pediu
      if (wantToSave && !manualSaved) {
        const savedId = await saveManualVehicle();
        if (savedId) {
          setManualSaved(true);
        }
      }
    }

    if (problem.trim().length < 10) {
      setSubmitError("Descreva o problema com pelo menos 10 caracteres.");
      return;
    }

    setFormStep("submitting");

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          vehicle: vehicleLabel,
          year: inputMode === "placa"
            ? (vehicles.find((v) => v.id === selectedVehicleId) ?? foundVehicle)?.ano
            : manual.ano,
          part: problem.trim(),
          message: `Veículo: ${vehicleLabel}\n\n${problem.trim()}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error || "Erro ao enviar orçamento.");
        setFormStep("ready");
        return;
      }

      setFormStep("success");
    } catch {
      setSubmitError("Falha de conexão. Tente novamente.");
      setFormStep("ready");
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────

  if (formStep === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        <p className="text-muted-foreground text-sm">Carregando sua garagem...</p>
      </div>
    );
  }

  if (formStep === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-in zoom-in duration-500">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">Orçamento Enviado!</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            A loja <strong className="text-foreground">{storeName}</strong> recebeu seu pedido.
            Acompanhe a resposta na área de orçamentos.
          </p>
        </div>
        <a
          href="/painel/cliente/orcamentos"
          className="text-sm text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors"
        >
          Ver meus orçamentos →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Tabs: Modo de entrada ─────────────────────────────────────────── */}
      <div className="flex gap-2 p-1 bg-background rounded-xl border border-border-subtle">
        <button
          type="button"
          onClick={() => switchMode("placa")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            inputMode === "placa"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <Database className="w-4 h-4" />
          Consultar Placa
        </button>
        <button
          type="button"
          onClick={() => switchMode("manual")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            inputMode === "manual"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <PenLine className="w-4 h-4" />
          Digitar Manualmente
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODO: CONSULTA POR PLACA
      ══════════════════════════════════════════════════════════════════════ */}
      {inputMode === "placa" && (
        <div className="space-y-4">

          {/* Campo de busca de placa */}
          <div className="relative overflow-hidden rounded-2xl border border-border-subtle p-1">
            {!placaApiAvailable && (
              <div 
                onClick={() => setSearchError("Função de pesquisa por placas indisponível")}
                className="absolute inset-0 bg-zinc-950/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-20 animate-scale-in cursor-pointer"
              >
                <X className="w-6 h-6 text-amber-500 mb-1" />
                <p className="text-xs font-black text-white">Pesquisa por Placas Indisponível</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Use "Digitar Manualmente" para enviar o orçamento.</p>
              </div>
            )}
            <label className="text-sm font-bold text-foreground/80 mb-2 block px-3 pt-2">
              Placa do Veículo
            </label>
            <div className="relative px-3 pb-3">
              <input
                type="text"
                value={searchPlaca}
                disabled={!placaApiAvailable}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().slice(0, 8);
                  setSearchPlaca(val);
                  setSearchError("");
                  const clean = val.replace(/[^A-Z0-9]/g, "");
                  if (clean.length === 7) {
                    setTimeout(() => handleSearchPlaca(clean), 100);
                  } else {
                    setFoundVehicle(null);
                    setPlateConfirmed(null);
                    setIsEditingPlate(false);
                    if (clean.length < 7) {
                      setSelectedVehicleId(null);
                    }
                  }
                }}
                placeholder="ABC-1234"
                maxLength={8}
                className="w-full text-center font-mono text-xl tracking-[0.25em] bg-background border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all uppercase placeholder:text-zinc-700 placeholder:text-base placeholder:tracking-normal disabled:opacity-40"
              />
              <div className="absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none">
                {searchLoading ? <Loader2 className="w-5 h-5 text-violet-400 animate-spin" /> : <Search className="w-5 h-5 text-zinc-600" />}
              </div>
            </div>
            {searchError && (
              <div className="px-3 pb-2">
                <p className="flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {searchError}
                </p>
              </div>
            )}
          </div>

          {/* Veículo encontrado (API ou cache da garagem) */}
          {(foundVehicle || (selectedVehicleId && vehicles.find(v => v.id === selectedVehicleId))) && !isEditingPlate && (
            <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
              <VehicleSelectCard
                vehicle={foundVehicle || vehicles.find(v => v.id === selectedVehicleId)!}
                selected
                onSelect={() => {}}
              />
              
              {plateConfirmed === null && (
                <div className="bg-panel/50 border border-border-subtle rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground/80">Essas informações estão corretas?</span>
                  <div className="flex gap-2">
                    <Button type="button" onClick={() => setPlateConfirmed(true)} className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 h-8 px-4 text-xs font-bold border-emerald-500/30">Sim</Button>
                    <Button type="button" onClick={() => {
                        setPlateConfirmed(false);
                        setIsEditingPlate(true);
                        setEditedVehicle(foundVehicle || vehicles.find(v => v.id === selectedVehicleId)!);
                    }} className="bg-zinc-800 text-foreground/80 hover:bg-zinc-700 h-8 px-4 text-xs font-bold">Não</Button>
                  </div>
                </div>
              )}

              {plateConfirmed === true && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" /> Informações confirmadas
                </div>
              )}

              {justSaved && (
                <PrivacyBanner onDismiss={() => setJustSaved(false)} />
              )}
            </div>
          )}

          {isEditingPlate && editedVehicle && (
             <div className="space-y-4 p-5 border border-border-subtle rounded-2xl bg-panel/40 animate-in slide-in-from-right-4 duration-300">
               <div className="flex items-center justify-between mb-2">
                 <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                   <PenLine className="w-4 h-4 text-violet-400" /> Editar Dados ({editedVehicle.placa})
                 </h4>
                 <button type="button" onClick={() => {
                    setIsEditingPlate(false);
                    setPlateConfirmed(null);
                 }} className="text-muted-foreground hover:text-white bg-zinc-800 rounded-full p-1"><X className="w-4 h-4" /></button>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Marca</label>
                   <input type="text" value={editedVehicle.marca} onChange={e => setEditedVehicle(p => ({...p!, marca: e.target.value.toUpperCase()}))} className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-foreground text-sm" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Modelo</label>
                   <input type="text" value={editedVehicle.modelo} onChange={e => setEditedVehicle(p => ({...p!, modelo: e.target.value.toUpperCase()}))} className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-foreground text-sm" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Ano</label>
                   <input type="text" value={editedVehicle.ano} onChange={e => setEditedVehicle(p => ({...p!, ano: e.target.value.replace(/\D/g, "").slice(0, 4)}))} maxLength={4} className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-foreground text-sm" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Cor</label>
                   <input type="text" value={editedVehicle.cor} onChange={e => setEditedVehicle(p => ({...p!, cor: e.target.value.toUpperCase()}))} className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-foreground text-sm" />
                 </div>
               </div>
               <Button type="button" onClick={() => {
                  if (foundVehicle) setFoundVehicle(editedVehicle);
                  setVehicles(prev => prev.map(v => v.id === editedVehicle.id ? editedVehicle : v));
                  setIsEditingPlate(false);
                  setPlateConfirmed(true);
               }} className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Confirmar Correções</Button>
             </div>
          )}

          {/* Garagem — outros veículos */}
          {vehicles.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">
                Minha Garagem
              </p>
              <div className="grid gap-3">
                {vehicles
                  .filter((v) => v.id !== foundVehicle?.id)
                  .map((v) => (
                    <VehicleSelectCard
                      key={v.id}
                      vehicle={v}
                      selected={selectedVehicleId === v.id}
                      onSelect={(id) => {
                        setSelectedVehicleId(id);
                        setFoundVehicle(v);
                        setPlateConfirmed(null);
                        setIsEditingPlate(false);
                      }}
                    />
                  ))}
              </div>
            </div>
          )}

          {vehicles.length === 0 && !foundVehicle && (
            <div className="text-center py-8 rounded-2xl border border-dashed border-border-subtle bg-panel/20">
              <Car className="w-7 h-7 text-zinc-700 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Busque uma placa acima para começar.</p>
              <p className="text-zinc-600 text-xs mt-1">
                Veículos pesquisados são salvos automaticamente para futuros orçamentos.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODO: ENTRADA MANUAL
      ══════════════════════════════════════════════════════════════════════ */}
      {inputMode === "manual" && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <p className="text-xs text-muted-foreground">
            Campos marcados com <span className="text-red-400">*</span> são obrigatórios.
          </p>

          {/* Grid obrigatórios */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Marca <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={manual.marca}
                onChange={(e) => setManual((p) => ({ ...p, marca: e.target.value.toUpperCase() }))}
                placeholder="Ex: HONDA"
                required
                className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all uppercase placeholder:normal-case placeholder:text-zinc-700"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Modelo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={manual.modelo}
                onChange={(e) => setManual((p) => ({ ...p, modelo: e.target.value.toUpperCase() }))}
                placeholder="Ex: CIVIC"
                required
                className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all uppercase placeholder:normal-case placeholder:text-zinc-700"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Cor <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={manual.cor}
                onChange={(e) => setManual((p) => ({ ...p, cor: e.target.value.toUpperCase() }))}
                placeholder="Ex: PRATA"
                required
                className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all uppercase placeholder:normal-case placeholder:text-zinc-700"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Ano <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={manual.ano}
                onChange={(e) => setManual((p) => ({ ...p, ano: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                placeholder="Ex: 2022"
                maxLength={4}
                required
                className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all placeholder:text-zinc-700"
              />
            </div>
          </div>

          {/* Opcionais em accordeon leve */}
          <details className="group">
            <summary className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground/80 cursor-pointer select-none transition-colors list-none">
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90" />
              Campos opcionais (Combustível, Versão, Cidade)
            </summary>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: "combustivel", label: "Combustível", placeholder: "Ex: Flex" },
                { key: "versao",      label: "Versão",      placeholder: "Ex: EXL 2.0" },
                { key: "cidade",      label: "Cidade",      placeholder: "Ex: São Paulo" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={manual[key as keyof ManualVehicle]}
                    onChange={(e) => setManual((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all placeholder:text-zinc-700"
                  />
                </div>
              ))}
            </div>
          </details>

          {/* Toggle: Salvar na garagem? */}
          <div className={`rounded-2xl border p-4 transition-all ${
            wantToSave
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-border-subtle bg-panel/30"
          }`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={wantToSave}
                  onChange={(e) => {
                    setWantToSave(e.target.checked);
                    setManualSaved(false);
                  }}
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  wantToSave
                    ? "bg-emerald-500 border-emerald-500"
                    : "bg-transparent border-zinc-600"
                }`}>
                  {wantToSave && (
                    <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Salvar na Minha Garagem
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Facilita futuros orçamentos. Seus dados ficam protegidos com criptografia AES-256.
                </p>
              </div>
            </label>
          </div>

          {/* Banner LGPD aparece se optou por salvar */}
          {wantToSave && (
            <PrivacyBanner
              onDismiss={() => { /* mantém checkbox marcado, só fecha o banner */ }}
              className="animate-in slide-in-from-bottom-2 duration-300"
            />
          )}
        </div>
      )}

      {/* ── Descrição do problema (ambos os modos) ─────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-foreground/80">
            Descreva o Problema / Peça Desejada <span className="text-red-400">*</span>
          </label>
          <span className={`text-xs tabular-nums ${
            problem.length > MAX_CHARS * 0.9 ? "text-amber-400" : "text-zinc-600"
          }`}>
            {problem.length}/{MAX_CHARS}
          </span>
        </div>

        <textarea
          rows={5}
          maxLength={MAX_CHARS}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder={
            inputMode === "placa"
              ? "Ex: Preciso de um amortecedor dianteiro direito novo. Qual prazo e valor?"
              : "Ex: Preciso trocar a pastilha de freio traseira. Tem para este modelo?"
          }
          className="w-full bg-background border border-border-subtle rounded-2xl px-5 py-4 text-foreground text-sm leading-relaxed placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* ── Erro de submissão ──────────────────────────────────────────────── */}
      {submitError && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {submitError}
        </div>
      )}

      {/* ── Botão enviar ───────────────────────────────────────────────────── */}
      <Button
        type="submit"
        disabled={
          formStep === "submitting" ||
          problem.trim().length < 10 ||
          (inputMode === "placa" && plateConfirmed !== true) ||
          (inputMode === "manual" && (!manual.marca || !manual.modelo || !manual.cor || !manual.ano))
        }
        loading={formStep === "submitting" || isSavingManual}
        className="w-full h-14 bg-violet-600 hover:bg-violet-500 text-white font-bold text-base shadow-[0_0_30px_rgba(139,92,246,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Send className="w-5 h-5 mr-2" />
        {isSavingManual ? "Salvando..." : "Enviar Pedido de Orçamento"}
      </Button>

      {/* Nota de segurança no rodapé */}
      <p className="text-center text-[11px] text-zinc-600 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5" />
        Seus dados são protegidos por criptografia de ponta a ponta (AES-256-GCM)
      </p>
    </form>
  );
}
