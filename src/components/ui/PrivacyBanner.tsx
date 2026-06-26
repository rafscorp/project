"use client";

import { useState } from "react";
import { ShieldCheck, X, Lock, ExternalLink } from "lucide-react";

// =============================================================================
// PrivacyBanner.tsx
// Banner LGPD com aviso de criptografia AES-256-GCM.
// Exibido após o auto-save silencioso do veículo na Garagem Virtual.
// =============================================================================

interface PrivacyBannerProps {
  onDismiss?: () => void;
  className?: string;
}

export function PrivacyBanner({ onDismiss, className = "" }: PrivacyBannerProps) {
  const [visible, setVisible] = useState(true);

  function dismiss() {
    setVisible(false);
    onDismiss?.();
  }

  if (!visible) return null;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border border-emerald-500/20
        bg-gradient-to-r from-emerald-950/60 to-zinc-900/60
        backdrop-blur-sm p-4 sm:p-5
        animate-in slide-in-from-bottom-4 fade-in duration-500
        ${className}
      `}
    >
      {/* Glow de fundo */}
      <div className="absolute -left-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex items-start gap-4">
        {/* Ícone Escudo */}
        <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="text-sm font-bold text-emerald-400">
              Dados Salvos com Segurança Máxima
            </h4>
            {/* Selo PCI/AES */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold tracking-wider">
              <Lock className="w-3 h-3" />
              AES-256
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            As informações do seu veículo foram salvas na{" "}
            <span className="text-foreground font-medium">Garagem Virtual</span> para
            agilizar futuros orçamentos. Dados sensíveis (chassi, motor) são
            protegidos por{" "}
            <span className="text-emerald-400 font-semibold">
              criptografia de ponta a ponta (AES-256-GCM)
            </span>{" "}
            e nunca são compartilhados com terceiros.
          </p>

          <div className="mt-3 flex items-center gap-4">
            <a
              href="/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-emerald-400 transition-colors underline-offset-4 underline"
            >
              <ExternalLink className="w-3 h-3" />
              Política de Privacidade (LGPD)
            </a>
            <span className="text-zinc-700 text-xs">|</span>
            <a
              href="/painel/cliente/garagem"
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Gerenciar minha Garagem
            </a>
          </div>
        </div>

        {/* Botão fechar */}
        <button
          onClick={dismiss}
          aria-label="Fechar aviso"
          className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
