"use client";

import { useState } from "react";
import { Shield, AlertCircle, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

// =============================================================================
// TwoFactorChallenge.tsx
// Tela de verificação 2FA que intercepta o login de Admin/Lojista.
// Exibida quando a sessão existe mas twoFactorVerifiedAt está vencido.
// =============================================================================

interface TwoFactorChallengeProps {
  onSuccess: () => void;
  userEmail?: string;
}

export function TwoFactorChallenge({ onSuccess, userEmail }: TwoFactorChallengeProps) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(token.replace(/\s/g, ""))) {
      setError("O código deve ter 6 dígitos numéricos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Código inválido ou expirado.");
        setToken("");
        return;
      }

      onSuccess();
    } catch {
      setError("Falha de conexão. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 bg-mesh-dark">
      <div className="w-full max-w-sm">
        <div className="glass-panel p-8 rounded-3xl border border-white/8 bg-panel/60 backdrop-blur-xl space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-500">

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-black text-foreground">Verificação 2FA</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {userEmail
                  ? <>Conta: <span className="text-zinc-200 font-medium">{userEmail}</span></>
                  : "Insira o código do seu aplicativo autenticador"
                }
              </p>
            </div>
          </div>

          {/* Instruções */}
          <div className="bg-violet-500/5 border border-violet-500/15 rounded-2xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Abra o{" "}
              <span className="text-foreground font-semibold">Google Authenticator</span> ou{" "}
              <span className="text-foreground font-semibold">Authy</span> e insira o código de 6 dígitos.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2 text-center">
                Código de Autenticação
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                value={token}
                onChange={(e) => {
                  setToken(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                placeholder="000 000"
                className="
                  w-full text-center text-4xl font-mono font-black tracking-[0.6em]
                  bg-background border border-border-subtle rounded-2xl px-4 py-5 text-white
                  focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent
                  placeholder:text-zinc-800 placeholder:text-2xl placeholder:tracking-normal
                  transition-all
                "
              />
              <p className="text-center text-xs text-zinc-600 mt-2">
                Código muda a cada 30 segundos
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={token.length !== 6 || loading}
              loading={loading}
              className="w-full h-14 bg-violet-600 hover:bg-violet-500 font-bold text-base shadow-[0_0_30px_rgba(139,92,246,0.2)]"
            >
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><Lock className="w-5 h-5 mr-2" /> Verificar e Entrar</>
              }
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <a
              href="/suporte"
              className="text-xs text-zinc-600 hover:text-muted-foreground underline underline-offset-4 transition-colors"
            >
              Perdeu o acesso ao app autenticador?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
