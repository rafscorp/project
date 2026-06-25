"use client";

import { useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function LocationFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentLat = searchParams.get("lat");
  const currentLon = searchParams.get("lon");

  const isFilterActive = currentLat && currentLon;

  function handleGetLocation() {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocalização não suportada pelo navegador.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        currentParams.set("lat", latitude.toString());
        currentParams.set("lon", longitude.toString());
        currentParams.delete("state"); // Se buscar por GPS, ignora o estado
        
        router.push(`/lojas?${currentParams.toString()}`);
        setLoading(false);
      },
      (error) => {
        console.error("Erro de GPS:", error);
        if (error.code === error.PERMISSION_DENIED) {
          setError("Permissão negada. Ative o GPS no navegador.");
        } else {
          setError("Não foi possível obter a localização.");
        }
        setLoading(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }

  function handleClearLocation() {
    const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
    currentParams.delete("lat");
    currentParams.delete("lon");
    router.push(`/lojas?${currentParams.toString()}`);
  }

  return (
    <div className="mb-8 p-5 bg-zinc-950/50 rounded-2xl border border-white/5 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <h4 className="font-bold text-zinc-300 mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-violet-400" />
          Proximidade
        </h4>
        <p className="text-zinc-500 text-xs mb-4">
          Habilite o GPS para ver as lojas mais próximas a você.
        </p>

        {isFilterActive ? (
          <div className="space-y-3">
            <div className="flex items-center text-sm text-emerald-400 font-medium bg-emerald-400/10 p-2 rounded-lg border border-emerald-400/20">
              <Navigation className="h-4 w-4 mr-2" />
              Usando sua localização atual
            </div>
            <Button 
              variant="outline" 
              onClick={handleClearLocation}
              className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-10"
            >
              Remover Filtro
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Button 
              onClick={handleGetLocation} 
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold h-11 btn-shimmer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Localizando...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" /> Perto de Mim
                </>
              )}
            </Button>
            {error && (
              <p className="text-red-400 text-xs font-medium text-center">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
