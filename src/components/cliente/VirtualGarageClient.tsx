"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Plus, Trash2, Search, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { addVehicleFromPlaca, removeVehicle } from "@/app/actions/vehicle";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

type Vehicle = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  versao: string;
  ano: string;
  cor: string;
};

interface Props {
  userId: string;
  initialVehicles: Vehicle[];
}

export default function VirtualGarageClient({ userId, initialVehicles }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [placaInput, setPlacaInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlaca = placaInput.trim().toUpperCase();
    
    if (cleanPlaca.length < 7) {
      toast.error("Digite uma placa válida (ex: ABC1D23)");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Buscando dados do veículo na base nacional...");

    try {
      const res = await addVehicleFromPlaca(userId, cleanPlaca);
      
      if (res.success && res.vehicle) {
        toast.success("Veículo estacionado na garagem!", { id: toastId });
        setVehicles([res.vehicle as Vehicle, ...vehicles]);
        setPlacaInput("");
      } else {
        toast.error(res.error || "Placa não encontrada ou inválida.", { id: toastId });
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (vehicleId: string) => {
    setIsDeleting(vehicleId);
    try {
      const res = await removeVehicle(userId, vehicleId);
      if (res.success) {
        setVehicles(vehicles.filter((v) => v.id !== vehicleId));
        toast.success("Veículo removido da garagem.");
      } else {
        toast.error(res.error || "Erro ao remover veículo.");
      }
    } catch (error) {
      toast.error("Erro interno ao remover.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search / Add Form */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-32 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <form onSubmit={handleAddVehicle} className="relative z-10">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <label htmlFor="placa" className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-500" />
                Consultar e Adicionar Placa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-muted-foreground font-mono font-bold">🇧🇷</span>
                </div>
                <Input
                  id="placa"
                  placeholder="ABC1D23"
                  value={placaInput}
                  onChange={(e) => setPlacaInput(e.target.value.toUpperCase())}
                  className="pl-10 font-mono text-lg uppercase tracking-widest h-12"
                  maxLength={7}
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || placaInput.length < 7} 
              className="h-12 px-8 bg-amber-500 hover:bg-amber-600 text-black font-bold w-full md:w-auto transition-all"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Buscando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Estacionar
                </div>
              )}
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4" />
            <p>Ao adicionar, ativaremos a Busca Inteligente para mostrar apenas peças compatíveis com seu carro.</p>
          </div>
        </form>
      </motion.div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {vehicles.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-3xl bg-muted/20"
            >
              <Car className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground">Sua garagem está vazia</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                Adicione a placa do seu carro acima para começar a receber recomendações precisas de peças.
              </p>
            </motion.div>
          )}

          {vehicles.map((vehicle) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={vehicle.id}
              className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow hover:border-amber-500/50"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-muted px-3 py-1.5 rounded-lg border border-border/50 font-mono font-bold tracking-widest text-sm flex flex-col items-center shadow-inner">
                    <span className="text-[9px] leading-none text-muted-foreground mb-1 uppercase">Brasil</span>
                    {vehicle.placa.slice(0,3)}-{vehicle.placa.slice(3)}
                  </div>
                  
                  <button
                    onClick={() => handleRemove(vehicle.id)}
                    disabled={isDeleting === vehicle.id}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors disabled:opacity-50"
                    title="Remover veículo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-xl text-foreground truncate">
                    {vehicle.marca} {vehicle.modelo}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {vehicle.versao}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Ano</span>
                    <span className="font-medium">{vehicle.ano}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-muted-foreground text-xs">Cor</span>
                    <span className="font-medium">{vehicle.cor}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-500/10 border-t border-amber-500/20 px-6 py-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  Busca Inteligente Ativa
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
