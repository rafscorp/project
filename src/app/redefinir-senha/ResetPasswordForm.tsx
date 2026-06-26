"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Car, CheckCircle2, ArrowLeft, AlertTriangle } from "lucide-react";

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-xl text-foreground font-bold mb-2">Token Inválido</h2>
        <p className="text-muted-foreground mb-6">O link de redefinição de senha é inválido ou expirou.</p>
        <Link href="/esqueci-senha">
          <Button>Solicitar Novo Link</Button>
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Erro ao redefinir senha. Tente novamente.");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-panel/50 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-border-subtle/50 animate-scale-in">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Senha redefinida!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sua senha foi alterada com sucesso. Agora você pode fazer login com a nova senha.
            </p>
            <Link href="/login">
              <Button className="mt-6 w-full">
                <ArrowLeft className="h-4 w-4 mr-2" /> Ir para o login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-amber-400/10 p-2 rounded-xl group-hover:bg-amber-400/20 transition-colors">
              <Car className="h-8 w-8 text-amber-400" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">
              Agury<span className="text-amber-400">.</span>
            </span>
          </Link>
        </div>
        <h2 className="mt-6 text-center font-display text-3xl font-bold tracking-tight text-foreground">
          Criar nova senha
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-panel/50 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-border-subtle/50 animate-scale-in">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              <p className="font-semibold">Ops, algo deu errado</p>
              <p className="mt-1">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Nova Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirmar Nova Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full py-3 text-base" loading={loading}>
              Redefinir Senha
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
