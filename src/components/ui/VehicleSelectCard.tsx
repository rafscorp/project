"use client";

import { Car, Trash2, CheckCircle2, Shield, Fuel, Palette } from "lucide-react";

// =============================================================================
// VehicleSelectCard.tsx
// Card selecionável (estilo carteira digital) para a Garagem Virtual.
// Usado no formulário de orçamento para o cliente escolher o veículo.
// =============================================================================

export interface VehicleData {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  combustivel?: string;
  versao?: string;
}

interface VehicleSelectCardProps {
  vehicle: VehicleData;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

/** Mapeia cor do veículo para classes CSS visuais */
function getColorDot(cor: string): string {
  const map: Record<string, string> = {
    BRANCO: "bg-white border-zinc-400",
    PRATA: "bg-zinc-300 border-zinc-400",
    PRETO: "bg-black border-zinc-600",
    CINZA: "bg-zinc-500 border-zinc-600",
    VERMELHO: "bg-red-500 border-red-600",
    AZUL: "bg-blue-500 border-blue-600",
    VERDE: "bg-emerald-500 border-emerald-600",
    AMARELO: "bg-yellow-400 border-yellow-500",
    LARANJA: "bg-orange-500 border-orange-600",
    MARROM: "bg-amber-800 border-amber-900",
    DOURADO: "bg-amber-400 border-amber-500",
    BEGE: "bg-amber-100 border-amber-200",
    VINHO: "bg-rose-900 border-rose-950",
    ROXO: "bg-purple-600 border-purple-700",
  };
  return map[cor?.toUpperCase()] ?? "bg-zinc-600 border-zinc-700";
}

/** Formata a placa com hífen (ABC-1234 ou ABC1D23) */
function formatPlaca(placa: string): string {
  if (placa.length === 7) {
    return `${placa.slice(0, 3)}-${placa.slice(3)}`;
  }
  return placa;
}

export function VehicleSelectCard({
  vehicle,
  selected,
  onSelect,
  onDelete,
  showDelete = false,
}: VehicleSelectCardProps) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={() => onSelect(vehicle.id)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(vehicle.id)}
      className={`
        relative group cursor-pointer rounded-2xl border p-4 transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-violet-500/50
        ${selected
          ? "border-violet-500/60 bg-violet-500/10 shadow-[0_0_24px_rgba(139,92,246,0.12)]"
          : "border-white/8 bg-panel/50 hover:border-white/15 hover:bg-zinc-800/50"
        }
      `}
    >
      {/* Indicador de seleção (canto superior direito) */}
      <div
        className={`
          absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
          ${selected
            ? "border-violet-500 bg-violet-500"
            : "border-zinc-600 bg-transparent"
          }
        `}
      >
        {selected && <CheckCircle2 className="w-4 h-4 text-foreground fill-violet-500" strokeWidth={3} />}
      </div>

      {/* Linha superior: placa + ícone do carro */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`
          p-2.5 rounded-xl border transition-colors shrink-0
          ${selected
            ? "bg-violet-500/20 border-violet-500/30"
            : "bg-zinc-800 border-border-subtle"
          }
        `}>
          <Car className={`w-5 h-5 ${selected ? "text-violet-400" : "text-muted-foreground"}`} />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          {/* Placa (destaque principal) */}
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono font-black text-foreground text-base tracking-widest">
              {formatPlaca(vehicle.placa)}
            </span>
            {selected && (
              <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded-full">
                SELECIONADO
              </span>
            )}
          </div>
          {/* Marca + Modelo */}
          <p className="text-sm font-semibold text-zinc-200 truncate">
            {vehicle.marca} {vehicle.modelo}
          </p>
        </div>
      </div>

      {/* Linha de detalhes */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Ano */}
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="text-zinc-600">📅</span>
          {vehicle.ano}
        </span>

        {/* Cor */}
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Palette className="w-3.5 h-3.5 text-zinc-600" />
          <span className={`w-3 h-3 rounded-full border ${getColorDot(vehicle.cor)} inline-block`} />
          {vehicle.cor}
        </span>

        {/* Combustível */}
        {vehicle.combustivel && vehicle.combustivel !== "—" && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Fuel className="w-3.5 h-3.5 text-zinc-600" />
            {vehicle.combustivel}
          </span>
        )}

        {/* Versão */}
        {vehicle.versao && vehicle.versao !== "—" && (
          <span className="text-xs text-muted-foreground italic truncate max-w-[120px]">
            {vehicle.versao}
          </span>
        )}
      </div>

      {/* Ícone cadeado (dados protegidos) */}
      <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-zinc-600">
          <Shield className="w-3 h-3" />
          Dados criptografados (AES-256)
        </div>

        {/* Botão deletar (apenas no modo Garagem) */}
        {showDelete && onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(vehicle.id);
            }}
            aria-label="Remover veículo da garagem"
            className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
