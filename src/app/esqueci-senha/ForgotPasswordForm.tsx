"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Car, CheckCircle2, ArrowLeft } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Informe seu e-mail.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Erro ao processar. Tente novamente.");
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-amber-400/10 p-2 rounded-xl group-hover:bg-amber-400/20 transition-colors">
              <Car className="h-8 w-8 text-amber-400" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              Agury<span className="text-amber-400">.</span>
            </span>
          </Link>
        </div>
        <h2 className="mt-6 text-center font-display text-3xl font-bold tracking-tight text-white">
          Recuperar senha
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Lembrou a senha?{" "}
          <Link href="/login" className="font-medium text-amber-400 hover:text-amber-300">
            Fazer login
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900/50 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-zinc-800/50 animate-scale-in">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Email enviado!</h3>
              <p className="text-sm text-zinc-400">
                Se o e-mail <strong className="text-white">{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.
              </p>
              <p className="text-xs text-zinc-500">
                Verifique também a pasta de spam. O link expira em 60 minutos.
              </p>
              <Link href="/login">
                <Button variant="outline" className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  <p className="font-semibold">Ops, algo deu errado</p>
                  <p className="mt-1">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <Input
                  label="Endereço de Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
                <Button type="submit" className="w-full py-3 text-base" loading={loading}>
                  Enviar link de recuperação
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
