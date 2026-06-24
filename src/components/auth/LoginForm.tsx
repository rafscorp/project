"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: password || undefined, code: code || undefined }),
    });

    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      setError(json.error || "Erro ao entrar");
      return;
    }

    router.push(json.data.redirect);
    router.refresh();
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input label="Código de acesso" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} placeholder="123456" />
        <p className="text-xs text-zinc-500">Se você acabou de criar a loja, use o código recebido no cadastro.</p>
        <Button type="submit" className="w-full" loading={loading}>Entrar</Button>
      </form>
      <div className="mt-6 space-y-2 text-center text-sm text-zinc-500">
        <p><Link href="/cadastro/empresa" className="text-amber-400 hover:underline">Cadastrar minha empresa</Link></p>
        <p><Link href="/cadastro/cliente" className="text-amber-400 hover:underline">Criar conta de cliente</Link></p>
      </div>
    </>
  );
}
