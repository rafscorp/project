"use client";

import { useState } from "react";
import { Plus, Trash2, Info } from "lucide-react";
import { VehicleSelectCard, VehicleData } from "@/components/ui/VehicleSelectCard";

interface VehicleFull extends VehicleData {
  chassi?: string;
  motor?: string;
  ownerName?: string;
  cidade?: string;
  createdAt?: string;
}

export function GarageClient({ initialVehicles }: { initialVehicles: VehicleFull[] }) {
  const [vehicles, setVehicles] = useState<VehicleFull[]>(initialVehicles);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Remover este veículo da sua garagem?")) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setVehicles((prev) => prev.filter((v) => v.id !== id));
        if (selectedId === id) setSelectedId(null);
      }
    } finally {
      setDeletingId(null);
    }
  }

  const selected = vehicles.find((v) => v.id === selectedId);

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Lista de veículos */}
      <div className="lg:col-span-3 space-y-3">
        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-3xl border border-dashed border-border-subtle bg-panel/20 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center">
              <Plus className="w-6 h-6 text-zinc-600" />
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Garagem vazia</p>
              <p className="text-zinc-600 text-sm mt-1">
                Busque uma placa ao criar um orçamento para salvar automaticamente.
              </p>
            </div>
          </div>
        ) : (
          vehicles.map((v) => (
            <VehicleSelectCard
              key={v.id}
              vehicle={v}
              selected={selectedId === v.id}
              onSelect={setSelectedId}
              onDelete={() => handleDelete(v.id)}
              showDelete
            />
          ))
        )}
      </div>

      {/* Painel de detalhes (quando selecionado) */}
      <div className="lg:col-span-2">
        {selected ? (
          <div className="glass-panel p-6 rounded-2xl border border-border-subtle bg-panel/40 space-y-5 sticky top-6">
            <h3 className="font-bold text-foreground text-lg">
              {selected.marca} {selected.modelo}
            </h3>

            <div className="space-y-3">
              {[
                { label: "Placa", value: selected.placa },
                { label: "Ano", value: selected.ano },
                { label: "Cor", value: selected.cor },
                { label: "Versão", value: selected.versao || "—" },
                { label: "Combustível", value: selected.combustivel || "—" },
                { label: "Cidade", value: (selected as any).cidade || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground font-medium">{value}</span>
                </div>
              ))}
            </div>

            {/* Dados sensíveis (mascarados por padrão) */}
            <div className="pt-4 border-t border-border-subtle space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5" />
                Dados protegidos por AES-256
              </div>
              {[
                { label: "Chassi", value: (selected as any).chassi || "—" },
                { label: "Motor", value: (selected as any).motor || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground/80 font-mono text-xs">{value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleDelete(selected.id)}
              disabled={deletingId === selected.id}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Remover da Garagem
            </button>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center py-16 rounded-2xl border border-dashed border-border-subtle bg-panel/20">
            <p className="text-zinc-600 text-sm">Selecione um veículo para ver detalhes</p>
          </div>
        )}
      </div>
    </div>
  );
}
