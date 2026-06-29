"use client";

import { useState, useEffect } from "react";
import { Settings, CheckCircle2, Send, Loader2, Search, Edit3, AlertTriangle, Car, ShieldCheck, Fingerprint, Activity, Palette, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface CustomPartRequestProps {
  storeId: string;
  storeName: string;
  isCustomer: boolean;
  storeSlug: string;
}

interface VehicleData {
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  chassi: string;
  motor: string;
  _simulado?: boolean;
}

export function CustomPartRequest({ storeId, storeName, isCustomer, storeSlug }: CustomPartRequestProps) {
  const router = useRouter();
  
  const [mode, setMode] = useState<"placa" | "manual">("placa");
  
  // States para busca por placa
  const [placa, setPlaca] = useState("");
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  
  // States para modo manual
  const [manualMarca, setManualMarca] = useState("");
  const [manualModelo, setManualModelo] = useState("");
  const [manualAno, setManualAno] = useState("");
  const [manualCor, setManualCor] = useState("");
  const [manualChassi, setManualChassi] = useState("");
  const [manualMotor, setManualMotor] = useState("");
  
  // Campo da peça solicitado em ambos os modos
  const [part, setPart] = useState("");
  
  const [searchingPlaca, setSearchingPlaca] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [o2oCode, setO2oCode] = useState("");
  const [error, setError] = useState("");
  const [placaApiAvailable, setPlacaApiAvailable] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/veiculos/placa-status");
        if (res.ok) {
          const data = await res.json();
          setPlacaApiAvailable(data.available);
          if (!data.available) {
            setError("Função de pesquisa por placas indisponível");
          }
        }
      } catch {
        setPlacaApiAvailable(true);
      }
    }
    checkStatus();
  }, []);

  // Handler para busca de placa
  const handleSearchPlaca = async () => {
    const clean = placa.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (clean.length !== 7) {
      setError("Placa inválida. Digite 7 caracteres (ex: ABC1234 ou ABC1D23).");
      return;
    }
    
    setSearchingPlaca(true);
    setError("");
    setVehicleData(null);

    try {
      const res = await fetch(`/api/veiculos/placa/${clean}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erro ao consultar placa.");
      }
      
      setVehicleData(data);
    } catch (err: any) {
      setError(err.message || "Erro de conexão ao buscar placa.");
    } finally {
      setSearchingPlaca(false);
    }
  };

  const handleReset = () => {
    setVehicleData(null);
    setPlaca("");
    setPart("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isCustomer) {
      router.push(`/login?callbackUrl=/loja/${storeSlug}`);
      return;
    }

    let finalVehicleString = "";
    let finalYear = "";

    if (mode === "placa") {
      if (!vehicleData) return;
      // Constrói a string contendo os dados identificados pela placa de forma estruturada (EXATAMENTE os campos solicitados)
      finalVehicleString = [
        `PLACA: ${vehicleData.placa}`,
        `MARCA: ${vehicleData.marca}`,
        `MODELO: ${vehicleData.modelo}`,
        `ANO: ${vehicleData.ano}`,
        `COR: ${vehicleData.cor}`,
        `CHASSI: ${vehicleData.chassi}`,
        `MOTOR: ${vehicleData.motor}`
      ].join(" | ");
      
      finalYear = vehicleData.ano;
    } else {
      if (!manualMarca || !manualModelo || !manualAno) {
        setError("Por favor, preencha os campos obrigatórios (Marca, Modelo e Ano).");
        return;
      }
      // Constrói a string manual com os mesmos campos
      finalVehicleString = [
        `MARCA: ${manualMarca.toUpperCase()}`,
        `MODELO: ${manualModelo.toUpperCase()}`,
        `ANO: ${manualAno.trim()}`,
        manualCor ? `COR: ${manualCor.toUpperCase()}` : "COR: —",
        manualChassi ? `CHASSI: ${manualChassi.toUpperCase()}` : "CHASSI: —",
        manualMotor ? `MOTOR: ${manualMotor.toUpperCase()}` : "MOTOR: —",
        "(Inserido Manualmente)"
      ].join(" | ");
      
      finalYear = manualAno;
    }

    if (!part.trim()) {
      setError("Por favor, descreva a peça que você precisa.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          vehicle: finalVehicleString,
          year: finalYear,
          part
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar pedido de orçamento.");
      }

      setSuccess(true);
      if (data.o2oCode) {
        setO2oCode(data.o2oCode);
      }
      
      // Limpa os estados
      setVehicleData(null);
      setPlaca("");
      setPart("");
      setManualMarca("");
      setManualModelo("");
      setManualAno("");
      setManualCor("");
      setManualChassi("");
      setManualMotor("");
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao enviar.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mt-12 overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-panel/40 p-12 text-center relative animate-scale-in">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>
        <h3 className="font-display font-black text-3xl text-foreground mb-4">Pedido Enviado!</h3>
        <p className="text-muted-foreground text-lg mb-6 max-w-xl mx-auto">
          A loja <strong>{storeName}</strong> recebeu os detalhes do veículo e a descrição da peça. 
        </p>

        {o2oCode && (
          <div className="mb-8 p-6 bg-zinc-900/80 border border-emerald-500/30 rounded-2xl max-w-md mx-auto shadow-2xl">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Seu Código de Fila (O2O)</p>
            <p className="text-5xl font-mono font-black tracking-[0.2em] text-emerald-400">{o2oCode}</p>
            <p className="text-xs text-zinc-400 mt-4 leading-relaxed">
              Apresente este código no balcão da loja física para agilizar seu atendimento e finalizar a compra. Uma cópia foi enviada para o seu e-mail.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => setSuccess(false)} variant="outline" className="border-border-subtle hover:bg-zinc-800 text-white font-bold h-12 px-8">
            Solicitar Outra Peça
          </Button>
          <Button onClick={() => router.push("/cliente/home")} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 px-8">
            Ir para a Home do Cliente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 overflow-hidden rounded-[2rem] border border-border-subtle bg-panel/40 relative backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row items-stretch">
        
        {/* PANEL LATERAL DE INFORMAÇÃO */}
        <div className="p-8 md:p-12 lg:w-5/12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-border-subtle relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
            <Settings className="h-7 w-7 text-emerald-400" />
          </div>
          <h3 className="font-display font-black text-3xl text-foreground mb-4">Peça sob Encomenda</h3>
          <p className="text-muted-foreground text-base mb-8">
            Precisa de uma peça específica que não está na vitrine? Solicite uma cotação rápida. Nós buscamos os dados exatos do seu carro para garantir compatibilidade.
          </p>
          <div className="space-y-4 mb-8 text-foreground/80 font-medium text-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold">1</div>
              <span>Busca inteligente pela placa ou inserção manual</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold">2</div>
              <span>Chassi e motor identificados evitam peças erradas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold">3</div>
              <span>Negociação direta e segura com o lojista</span>
            </div>
          </div>
          
          <div className="bg-background/40 border border-border-subtle rounded-2xl p-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Sistema anti-fraude ativo. Suas consultas de placa são protegidas e auditadas contra abusos de requisição.
            </p>
          </div>
        </div>
        
        {/* PANEL DO FORMULÁRIO */}
        <div className="p-8 md:p-12 lg:w-7/12 relative z-10 flex flex-col justify-center bg-background/20">

          {/* Seleção do Modo (Placa vs Manual) */}
          <div className="flex bg-panel/80 border border-border-subtle rounded-xl p-1 mb-8">
            <button
              type="button"
              onClick={() => { setMode("placa"); setError(""); }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${mode === "placa" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/10" : "text-muted-foreground hover:text-white"}`}
            >
              <Search className="w-4 h-4" /> Buscar por Placa
            </button>
            <button
              type="button"
              onClick={() => { setMode("manual"); handleReset(); }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${mode === "manual" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/10" : "text-muted-foreground hover:text-white"}`}
            >
              <Edit3 className="w-4 h-4" /> Digitar Manualmente
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-sm flex items-center gap-3 animate-shake">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* MODO PLACA — BUSCA INICIAL */}
            {mode === "placa" && !vehicleData && (
              <div className="space-y-4 bg-panel/30 p-6 rounded-2xl border border-border-subtle relative overflow-hidden">
                {!placaApiAvailable && (
                  <div 
                    onClick={() => setError("Função de pesquisa por placas indisponível")}
                    className="absolute inset-0 bg-zinc-950/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-20 animate-scale-in cursor-pointer"
                  >
                    <Settings className="w-8 h-8 text-amber-500 animate-spin mb-2" />
                    <p className="text-sm font-black text-white">Função de Pesquisa por Placas Indisponível</p>
                    <p className="text-xs text-muted-foreground mt-1">Por favor, utilize a inserção manual clicando em "Digitar Manualmente" acima.</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-emerald-400 uppercase tracking-wider">Placa Mercosul ou Tradicional</label>
                  <span className="text-[10px] text-muted-foreground">Ex: ABC1234 ou ABC1D23</span>
                </div>
                
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="PLACA"
                      value={placa}
                      onChange={e => setPlaca(e.target.value.replace(/[^a-zA-Z0-9-]/g, "").toUpperCase())}
                      maxLength={8}
                      disabled={!placaApiAvailable}
                      className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-emerald-500/50 outline-none uppercase font-mono tracking-widest text-xl text-center placeholder:text-zinc-700 disabled:opacity-40"
                    />
                  </div>
                  
                  <Button
                    type="button"
                    onClick={handleSearchPlaca}
                    disabled={searchingPlaca || !placaApiAvailable || placa.replace(/[^a-zA-Z0-9]/g, "").length < 7}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 font-black shrink-0 rounded-xl flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    {searchingPlaca ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Buscar</span>
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Os dados do veículo serão importados automaticamente da base nacional.
                </p>
              </div>
            )}

            {/* MODO PLACA — EXIBIÇÃO DETALHADA E LIMPA DOS DADOS ENCONTRADOS */}
            {mode === "placa" && vehicleData && (
              <div className="rounded-2xl overflow-hidden border border-emerald-500/30 bg-emerald-500/5 animate-scale-in">
                {/* Placa badge realista */}
                <div className="px-6 py-4 bg-emerald-500/10 border-b border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white border-2 border-zinc-950 rounded-md overflow-hidden font-mono text-zinc-950 flex flex-col w-28 text-center shadow-md">
                      <div className="bg-blue-600 text-white text-[7px] py-0.5 font-bold tracking-widest leading-none">BRASIL</div>
                      <div className="text-sm font-black tracking-tighter py-0.5">{vehicleData.placa}</div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Veículo Identificado</p>
                      <h4 className="text-foreground font-black text-base leading-tight">
                        {vehicleData.marca} {vehicleData.modelo}
                      </h4>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-muted-foreground hover:text-foreground text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-center"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Mudar Placa</span>
                  </button>
                </div>

                {/* Grid Limpo com EXATAMENTE os 6 campos solicitados */}
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-background/40">
                  
                  {/* Marca */}
                  <div className="bg-panel/60 rounded-xl p-3 border border-border-subtle flex items-start gap-3">
                    <Car className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Marca</p>
                      <p className="text-foreground font-black text-xs sm:text-sm mt-0.5">
                        {vehicleData.marca}
                      </p>
                    </div>
                  </div>

                  {/* Modelo */}
                  <div className="bg-panel/60 rounded-xl p-3 border border-border-subtle flex items-start gap-3">
                    <Car className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Modelo</p>
                      <p className="text-foreground font-black text-xs sm:text-sm mt-0.5">
                        {vehicleData.modelo}
                      </p>
                    </div>
                  </div>

                  {/* Ano */}
                  <div className="bg-panel/60 rounded-xl p-3 border border-border-subtle flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Ano</p>
                      <p className="text-foreground font-black text-xs sm:text-sm mt-0.5">
                        {vehicleData.ano}
                      </p>
                    </div>
                  </div>

                  {/* Cor */}
                  <div className="bg-panel/60 rounded-xl p-3 border border-border-subtle flex items-start gap-3">
                    <Palette className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Cor</p>
                      <p className="text-foreground font-black text-xs sm:text-sm mt-0.5 capitalize">
                        {vehicleData.cor ? vehicleData.cor.toLowerCase() : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Chassi */}
                  <div className="bg-panel/60 rounded-xl p-3 border border-border-subtle flex items-start gap-3">
                    <Fingerprint className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Chassi</p>
                      <p className="text-foreground font-mono font-bold text-xs sm:text-sm mt-0.5 select-all">
                        {vehicleData.chassi || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Motor */}
                  <div className="bg-panel/60 rounded-xl p-3 border border-border-subtle flex items-start gap-3">
                    <Activity className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Número do Motor</p>
                      <p className="text-foreground font-mono font-bold text-xs sm:text-sm mt-0.5 select-all">
                        {vehicleData.motor || "—"}
                      </p>
                    </div>
                  </div>

                  {vehicleData._simulado && (
                    <div className="col-span-1 sm:col-span-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-[11px] text-amber-400 font-medium text-center">
                      Modo de Teste ativo. Insira o token no .env para dados oficiais de Detran/SERPRO.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MODO MANUAL — FORMULÁRIO DETALHADO COMPLETO */}
            {mode === "manual" && (
              <div className="space-y-4 bg-panel/30 p-6 rounded-2xl border border-border-subtle animate-scale-in">
                <p className="text-xs text-muted-foreground mb-2">
                  Preencha os dados do veículo manualmente para anexar à solicitação.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Marca */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/80">Marca *</label>
                    <input
                      type="text"
                      placeholder="Ex: Honda, Toyota, Fiat"
                      required
                      value={manualMarca}
                      onChange={e => setManualMarca(e.target.value)}
                      className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-emerald-500/50 outline-none"
                    />
                  </div>

                  {/* Modelo */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/80">Modelo *</label>
                    <input
                      type="text"
                      placeholder="Ex: Civic 2.0 EXL, Corolla XEi"
                      required
                      value={manualModelo}
                      onChange={e => setManualModelo(e.target.value)}
                      className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-emerald-500/50 outline-none"
                    />
                  </div>

                  {/* Ano */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/80">Ano *</label>
                    <input
                      type="text"
                      placeholder="Ex: 2021"
                      required
                      value={manualAno}
                      onChange={e => setManualAno(e.target.value)}
                      className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-emerald-500/50 outline-none"
                    />
                  </div>

                  {/* Cor */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/80">Cor</label>
                    <input
                      type="text"
                      placeholder="Ex: Prata, Preto, Branco"
                      value={manualCor}
                      onChange={e => setManualCor(e.target.value)}
                      className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-emerald-500/50 outline-none"
                    />
                  </div>

                  {/* Chassi */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/80">Chassi (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Insira os 17 dígitos"
                      value={manualChassi}
                      onChange={e => setManualChassi(e.target.value)}
                      className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:ring-2 focus:ring-emerald-500/50 outline-none"
                    />
                  </div>

                  {/* Motor */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/80">Número do Motor (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Número do motor se souber"
                      value={manualMotor}
                      onChange={e => setManualMotor(e.target.value)}
                      className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:ring-2 focus:ring-emerald-500/50 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CAMPO DA PEÇA SOLICITADA */}
            <div className={`space-y-2 transition-all duration-300 ${mode === "placa" && !vehicleData ? "opacity-25 pointer-events-none" : "opacity-100"}`}>
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-foreground/80 uppercase tracking-wider">Descrição das Peças Necessárias *</label>
                <span className="text-[10px] text-muted-foreground">Seja o mais específico possível</span>
              </div>
              <textarea
                required
                rows={4}
                placeholder="Descreva a peça exata que você precisa comprar (ex: Par de Amortecedores Dianteiros Cofap, Bomba de Combustível Original Honda, Filtro de Óleo Bosch, etc.)"
                value={part}
                onChange={e => setPart(e.target.value)}
                className="w-full bg-panel/60 border border-border-subtle rounded-2xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-emerald-500/50 outline-none resize-none placeholder:text-zinc-600"
              />
            </div>

            {/* Ação de Enviar */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading || (mode === "placa" && !vehicleData) || !part.trim() || (mode === "manual" && (!manualMarca || !manualModelo || !manualAno))}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] border-none disabled:opacity-30 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Enviando Pedido...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Enviar Pedido de Cotação</span>
                  </>
                )}
              </Button>
              <p className="text-center text-[10px] text-muted-foreground mt-4 leading-normal">
                Ao enviar, a loja {storeName} criará uma sala de negociação privada no seu painel de cliente onde definirá preços e opções de retirada.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
