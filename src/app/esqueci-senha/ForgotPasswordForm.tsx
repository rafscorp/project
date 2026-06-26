"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Car, CheckCircle2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

import { BackButton } from "@/components/BackButton";

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
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <BackButton />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
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
          Recuperar senha
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Lembrou a senha?{" "}
          <Link href="/login" className="font-medium text-amber-400 hover:text-amber-300">
            Fazer login
          </Link>
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-zinc-100 dark:bg-panel/50 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-zinc-200 dark:border-border-subtle/50">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Email enviado!</h3>
              <p className="text-sm text-muted-foreground">
                Se o e-mail <strong className="text-foreground">{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.
              </p>
              <p className="text-xs text-muted-foreground">
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
      </motion.div>
    </div>
  );
}
