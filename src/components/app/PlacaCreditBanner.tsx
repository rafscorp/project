"use client";
import { useState } from "react";
import { CreditCard, Search, Zap } from "lucide-react";
import { PlacaPurchaseModal } from "./PlacaPurchaseModal";

interface PlacaCreditBannerProps {
  creditStatus: {
    allowed: boolean;
    isFreeQuota?: boolean;
    remaining?: number;
    freeUsed?: number;
    reason: string;
  } | null;
  onRefreshCredits: () => void;
}

export function PlacaCreditBanner({ creditStatus, onRefreshCredits }: PlacaCreditBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    setIsModalOpen(false);
    onRefreshCredits();
  };

  if (!creditStatus) return null;

  return (
    <>
      <div className="w-full bg-zinc-900/50 border border-border-subtle rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 text-left">
          {creditStatus.allowed ? (
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
              <Search className="w-6 h-6 text-blue-400" />
            </div>
          ) : (
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6 text-red-400" />
            </div>
          )}
          
          <div>
            <h3 className="font-bold text-foreground">
              {creditStatus.allowed ? "Consultas de Placa" : "Limite Atingido"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {creditStatus.isFreeQuota && (
                <>Você tem <strong className="text-foreground">{creditStatus.remaining} consultas gratuitas</strong> restantes.</>
              )}
              {creditStatus.allowed && !creditStatus.isFreeQuota && (
                <>Você possui <strong className="text-blue-400 font-bold">{creditStatus.remaining} créditos</strong> de consulta.</>
              )}
              {!creditStatus.allowed && creditStatus.reason === "no_credits" && (
                <>Suas consultas gratuitas acabaram. Compre créditos para continuar.</>
              )}
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className={`shrink-0 font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
            creditStatus.allowed && creditStatus.isFreeQuota
              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
          }`}
        >
          <Zap className="w-4 h-4" /> 
          {creditStatus.allowed && creditStatus.isFreeQuota ? "Aumentar Limite" : "Comprar Créditos"}
        </button>
      </div>

      <PlacaPurchaseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess} 
      />
    </>
  );
}
