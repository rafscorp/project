"use client";

import { useState, useEffect } from "react";
import { Shield, Smartphone, Copy, CheckCheck, Loader2, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// =============================================================================
// TwoFactorSetup.tsx
// Tela de configuração do 2FA — geração de QR Code e confirmação do código.
// =============================================================================

type SetupStep = "idle" | "loading-qr" | "scan" | "confirming" | "done" | "error";

export function TwoFactorSetup({ onSuccess }: { onSuccess?: () => void }) {
  const [step, setStep] = useState<SetupStep>("idle");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [otpUri, setOtpUri] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function startSetup() {
    setStep("loading-qr");
    setError("");
    try {
      const res = await fetch("/api/auth/2fa/setup");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao gerar QR Code.");
        setStep("error");
        return;
      }
      setQrCodeUrl(data.qrCodeDataUrl);
      setOtpUri(data.otpAuthUrl);
      setStep("scan");
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setStep("error");
    }
  }

  async function confirmToken() {
    if (!/^\d{6}$/.test(token.replace(/\s/g, ""))) {
      setError("Digite o código de 6 dígitos do seu app.");
      return;
    }

    setStep("confirming");
    setError("");
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Código inválido.");
        setStep("scan");
        return;
      }
      setStep("done");
      onSuccess?.();
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setStep("scan");
    }
  }

  async function copyUri() {
    await navigator.clipboard.writeText(otpUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/8 bg-panel/40 max-w-md w-full space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <Shield className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Autenticação em 2 Fatores</h2>
          <p className="text-xs text-muted-foreground">Proteja sua conta com TOTP (Google Authenticator)</p>
        </div>
      </div>

      {/* Passo 1: Idle */}
      {step === "idle" && (
        <div className="space-y-4">
          <div className="bg-violet-500/5 border border-violet-500/15 rounded-2xl p-4 space-y-2">
            {[
              "Instale o Google Authenticator ou Authy no celular",
              "Escaneie o QR Code que iremos gerar",
              "Digite o código de 6 dígitos para confirmar",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground/80">{text}</p>
              </div>
            ))}
          </div>
          <Button onClick={startSetup} className="w-full bg-violet-600 hover:bg-violet-500">
            <Smartphone className="w-4 h-4 mr-2" />
            Configurar 2FA Agora
          </Button>
        </div>
      )}

      {/* Passo 2: Loading QR */}
      {step === "loading-qr" && (
        <div className="flex flex-col items-center justify-center py-10 gap-4">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          <p className="text-sm text-muted-foreground">Gerando QR Code seguro...</p>
        </div>
      )}

      {/* Passo 3: QR Code para escanear */}
      {(step === "scan" || step === "confirming") && (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Abra seu app autenticador e escaneie o QR Code abaixo:
          </p>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-3 bg-background rounded-2xl border border-white/8">
              {qrCodeUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCodeUrl}
                  alt="QR Code 2FA"
                  width={200}
                  height={200}
                  className="rounded-xl"
                />
              )}
            </div>
          </div>

          {/* URI manual */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Não consegue escanear? Copie o código manualmente:
            </p>
            <button
              type="button"
              onClick={copyUri}
              className="w-full flex items-center gap-2 px-3 py-2 bg-background border border-white/8 rounded-xl text-xs font-mono text-muted-foreground hover:border-violet-500/30 transition-colors text-left"
            >
              <span className="flex-1 truncate">{otpUri.slice(0, 60)}...</span>
              {copied
                ? <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                : <Copy className="w-4 h-4 shrink-0" />
              }
            </button>
          </div>

          {/* Campo do código */}
          <div>
            <label className="text-sm font-bold text-foreground/80 mb-2 block">
              Código do Aplicativo
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={token}
              onChange={(e) => {
                setToken(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && confirmToken()}
              placeholder="000000"
              className="w-full text-center text-3xl font-mono font-black tracking-[0.5em] bg-background border border-border-subtle rounded-xl px-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-zinc-800 placeholder:text-xl placeholder:tracking-normal"
            />
          </div>

          {error && (
            <p className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </p>
          )}

          <Button
            onClick={confirmToken}
            disabled={token.length !== 6 || step === "confirming"}
            loading={step === "confirming"}
            className="w-full bg-violet-600 hover:bg-violet-500 h-12"
          >
            <Lock className="w-4 h-4 mr-2" />
            Confirmar e Ativar 2FA
          </Button>
        </div>
      )}

      {/* Passo 4: Erro */}
      {step === "error" && (
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
          <Button onClick={() => setStep("idle")} variant="outline" className="w-full border-border-subtle">
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Passo 5: Sucesso */}
      {step === "done" && (
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">2FA Ativado com Sucesso!</h3>
            <p className="text-sm text-muted-foreground">
              Sua conta agora está protegida por autenticação de dois fatores.
              O código do app será solicitado nos próximos logins.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
