"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Map, MapPinned, Loader2 } from "lucide-react";

interface UF {
  id: number;
  sigla: string;
  nome: string;
}

interface City {
  nome: string;
  codigo_ibge: string;
}

export function RegionFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentState = searchParams.get("state") || "";
  const currentCity = searchParams.get("city") || "";

  const [ufs, setUfs] = useState<UF[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingUf, setLoadingUf] = useState(true);
  const [loadingCity, setLoadingCity] = useState(false);

  // 1. Fetch UFs on mount
  useEffect(() => {
    async function fetchUFs() {
      try {
        const res = await fetch("https://brasilapi.com.br/api/ibge/uf/v1");
        const data = await res.json();
        // Ordena por sigla
        const sorted = data.sort((a: UF, b: UF) => a.sigla.localeCompare(b.sigla));
        setUfs(sorted);
      } catch (error) {
        console.error("Erro ao buscar estados:", error);
      } finally {
        setLoadingUf(false);
      }
    }
    fetchUFs();
  }, []);

  // 2. Fetch Cities when UF changes
  useEffect(() => {
    if (!currentState) {
      setCities([]);
      return;
    }

    async function fetchCities() {
      setLoadingCity(true);
      try {
        const res = await fetch(`https://brasilapi.com.br/api/ibge/municipios/v1/${currentState}`);
        const data = await res.json();
        const sorted = data.sort((a: City, b: City) => a.nome.localeCompare(b.nome));
        setCities(sorted);
      } catch (error) {
        console.error("Erro ao buscar cidades:", error);
      } finally {
        setLoadingCity(false);
      }
    }
    fetchCities();
  }, [currentState]);

  function handleStateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const state = e.target.value;
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    
    // Se selecionou um novo estado, apaga a cidade e seta o estado
    if (state) {
      params.set("state", state);
    } else {
      params.delete("state");
    }
    
    params.delete("city"); // Reseta cidade
    params.delete("lat");  // Reseta GPS caso estivesse ativo
    params.delete("lon");

    router.push(`/lojas?${params.toString()}`);
  }

  function handleCityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const city = e.target.value;
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (city) {
      params.set("city", city);
    } else {
      params.delete("city");
    }

    params.delete("lat"); // Reseta GPS
    params.delete("lon");

    router.push(`/lojas?${params.toString()}`);
  }

  return (
    <div className="mb-8">
      <h4 className="font-bold text-zinc-300 mb-4">Região</h4>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Map className="h-3 w-3" /> Estado (UF)
          </label>
          <div className="relative">
            <select
              value={currentState}
              onChange={handleStateChange}
              disabled={loadingUf}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none transition-all disabled:opacity-50"
            >
              <option value="">Brasil Inteiro</option>
              {ufs.map((uf) => (
                <option key={uf.id} value={uf.sigla}>{uf.sigla} - {uf.nome}</option>
              ))}
            </select>
            {loadingUf && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 animate-spin" />}
          </div>
        </div>

        {currentState && (
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPinned className="h-3 w-3" /> Cidade
            </label>
            <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
              <select
                value={currentCity}
                onChange={handleCityChange}
                disabled={loadingCity || cities.length === 0}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none transition-all disabled:opacity-50"
              >
                <option value="">Todas as Cidades</option>
                {cities.map((city, idx) => (
                  <option key={`${city.codigo_ibge}-${idx}`} value={city.nome}>{city.nome}</option>
                ))}
              </select>
              {loadingCity && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 animate-spin" />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
