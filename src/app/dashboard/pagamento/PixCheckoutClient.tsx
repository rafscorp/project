"use client";

import { useState } from "react";
import { QrCode, Copy, CheckCheck, Loader2, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

// =============================================================================
// PixCheckoutClient.tsx
// Componente Client para o fluxo de pagamento via PIX.
// Chama /api/checkout/mercadopago para gerar o QR Code e o código Copia e Cola.
// Mostra um polling de confirmação de pagamento após a geração.
// =============================================================================

interface Props {
  planId: string;
  price: number;
  planName: string;
}

type CheckoutStep = "idle" | "generating" | "awaiting-payment" | "confirmed" | "error";

interface PixData {
  qrCodeBase64: string; // imagem do QR Code em base64
  qrCodeText: string;   // código copia e cola
  paymentId: string;
}

export function PixCheckoutClient({ planId, price, planName }: Props) {
  const [step, setStep] = useState<CheckoutStep>("idle");
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Gera o PIX ──────────────────────────────────────────────────────────────
  async function handleGeneratePix() {
    setStep("generating");
    setErrorMsg("");

    try {
      const res = await fetch("/api/checkout/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Não foi possível gerar o PIX. Tente novamente.");
        setStep("error");
        return;
      }

      // Se o endpoint redireciona para URL externa do MP (caso legacy), abre numa nova aba
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank");
        setStep("idle");
        return;
      }

      // Dados do QR Code PIX nativo
      setPixData({
        qrCodeBase64: data.qrCodeBase64 ?? "",
        qrCodeText: data.qrCodeText ?? data.pixCopiaECola ?? "",
        paymentId: data.paymentId ?? "",
      });

      setStep("awaiting-payment");
      startPolling(data.paymentId);
    } catch {
      setErrorMsg("Falha de conexão. Verifique sua internet e tente novamente.");
      setStep("error");
    }
  }

  // ── Polling de status de pagamento ──────────────────────────────────────────
  function startPolling(paymentId: string) {
    if (!paymentId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/mercadopago/status?paymentId=${paymentId}`);
        if (res.ok) {
          const { status } = await res.json();
          if (status === "approved") {
            clearInterval(interval);
            setStep("confirmed");
          }
        }
      } catch { /* polling silencioso */ }
    }, 5000); // Verifica a cada 5s

    // Para de verificar após 30 minutos (timeout de sessão PIX)
    setTimeout(() => clearInterval(interval), 30 * 60 * 1000);
  }

  // ── Copia código ────────────────────────────────────────────────────────────
  async function handleCopy() {
    if (!pixData?.qrCodeText) return;
    await navigator.clipboard.writeText(pixData.qrCodeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════

  // ── Idle: Botão de gerar PIX ────────────────────────────────────────────────
  if (step === "idle" || step === "error") {
    return (
      <div className="space-y-3">
        <Button
          type="button"
          onClick={handleGeneratePix}
          className="w-full h-14 bg-[#00b1ea] hover:bg-[#009dd1] text-foreground font-bold text-base transition-all"
        >
          <QrCode className="w-5 h-5 mr-2" />
          Pagar com PIX — R$ {price.toFixed(2)}/mês
        </Button>

        {step === "error" && (
          <p className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </p>
        )}

        <p className="text-center text-xs text-zinc-600">
          Processado pelo Mercado Pago · Aprovação imediata
        </p>
      </div>
    );
  }

  // ── Gerando ─────────────────────────────────────────────────────────────────
  if (step === "generating") {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <Loader2 className="w-8 h-8 text-[#00b1ea] animate-spin" />
        <p className="text-sm text-muted-foreground">Gerando seu PIX...</p>
      </div>
    );
  }

  // ── Confirmado ──────────────────────────────────────────────────────────────
  if (step === "confirmed") {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-in zoom-in duration-500">
          <Zap className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-foreground">Pagamento Confirmado! 🎉</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Plano <strong className="text-foreground">{planName}</strong> ativo. Sua loja está no ar!
          </p>
        </div>
        <a
          href="/dashboard"
          className="text-sm text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors"
        >
          Ir para o painel →
        </a>
      </div>
    );
  }

  // ── Aguardando pagamento: QR Code + Copia e Cola ─────────────────────────────
  return (
    <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <p className="text-sm font-semibold text-foreground/80">
          PIX gerado! Escaneie ou copie o código.
        </p>
      </div>

      {/* QR Code */}
      {pixData?.qrCodeBase64 && (
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-2xl shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${pixData.qrCodeBase64}`}
              alt="QR Code PIX"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Código Copia e Cola */}
      {pixData?.qrCodeText && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
            PIX Copia e Cola
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-background border border-white/8 rounded-xl px-4 py-3 overflow-hidden">
              <p className="text-xs font-mono text-muted-foreground truncate select-all cursor-text">
                {pixData.qrCodeText}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={`shrink-0 px-4 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all ${
                copied
                  ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                  : "bg-panel border-border-subtle text-foreground/80 hover:border-[#00b1ea]/40 hover:text-[#00b1ea]"
              }`}
            >
              {copied
                ? <><CheckCheck className="w-4 h-4" /> Copiado!</>
                : <><Copy className="w-4 h-4" /> Copiar</>
              }
            </button>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-background/50 rounded-2xl border border-border-subtle p-4 space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Como pagar:
        </p>
        {[
          "Abra o app do seu banco",
          "Escolha Pagar com PIX",
          "Escaneie o QR Code ou use o código Copia e Cola",
          "Confirme o pagamento — a ativação é imediata!",
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="w-5 h-5 rounded-full bg-[#00b1ea]/10 border border-[#00b1ea]/20 text-[#00b1ea] text-xs font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            {step}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-zinc-600 flex items-center justify-center gap-1.5">
        <Loader2 className="w-3 h-3 animate-spin" />
        Aguardando confirmação automática do pagamento...
      </p>
    </div>
  );
}
