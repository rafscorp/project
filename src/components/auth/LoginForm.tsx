"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type AlertState = { type: "error" | "success"; message: string } | null;

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [alert, setAlert] = useState<AlertState>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });

  function validateField(field: "email" | "password", value: string) {
    if (field === "email") {
      if (!value.trim()) return "Informe seu e-mail.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "O e-mail precisa ser válido.";
      return "";
    }

    if (!value.trim()) return "Informe sua senha para entrar.";
    if (value.length < 6) return "A senha precisa ter ao menos 6 caracteres.";
    return "";
  }

  function updateField(field: "email" | "password", value: string) {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    if (alert) setAlert(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAlert(null);

    if (step === 1) {
      const nextErrors = {
        email: validateField("email", email),
        password: validateField("password", password),
      };
      setErrors(nextErrors);
      setTouched({ email: true, password: true });

      if (nextErrors.email || nextErrors.password) {
        setAlert({ type: "error", message: "Preencha os campos corretamente para entrar." });
        
        // Focus no primeiro campo com erro
        if (nextErrors.email) {
          document.getElementById('email')?.focus();
        } else if (nextErrors.password) {
          document.getElementById('password')?.focus();
        }
        
        return;
      }

      setLoading(true);
      
      // TODO: RE-ENABLE 2FA BEFORE PRODUCTION!
      // Bypass temporário do 2FA para debug. Chamando direto o /api/auth/login normal.
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      setLoading(false);

      if (!json.success) {
        setAlert({ type: "error", message: json.error || "E-mail ou senha incorretos." });
        return;
      }

      setAlert({ type: "success", message: "Entrando..." });
      router.push(json.data.redirect);
      router.refresh();

      // CÓDIGO ORIGINAL (DESABILITADO PARA DEBUG):
      /*
      const res = await fetch("/api/auth/verify-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      setLoading(false);

      if (!json.success) {
        setAlert({ type: "error", message: json.error || "E-mail ou senha incorretos." });
        return;
      }

      // Sucesso na verificação -> Vai pro Passo 2
      setAlert({ type: "success", message: "Código enviado para o seu e-mail!" });
      setStep(2);
      return;
      */
    }

    // Passo 2: Validar Código (DESABILITADO PARA DEBUG)
    if (step === 2) {
      if (code.length !== 6) {
        setAlert({ type: "error", message: "O código deve ter 6 dígitos." });
        return;
      }

      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const json = await res.json();
      setLoading(false);

      if (!json.success) {
        setAlert({ type: "error", message: json.error || "Código inválido." });
        return;
      }

      setAlert({ type: "success", message: "Entrando..." });
      router.push(json.data.redirect);
      router.refresh();
    }
  }

  return (
    <>
      {alert && (
        <div className={`mb-4 rounded-2xl border p-3 text-sm ${alert.type === "error" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>
          <p className="font-semibold">{alert.type === "error" ? "Ops, algo faltou" : "Tudo certo"}</p>
          <p className="mt-1">{alert.message}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Input id="email" label="E-mail" type="email" value={email} onChange={(e) => updateField("email", e.target.value)} onBlur={() => setTouched((prev) => ({ ...prev, email: true }))} error={touched.email ? errors.email : undefined} required />
            <Input id="password" label="Senha" type="password" value={password} onChange={(e) => updateField("password", e.target.value)} onBlur={() => setTouched((prev) => ({ ...prev, password: true }))} error={touched.password ? errors.password : undefined} required />
            <Button type="submit" className="w-full h-12 text-base font-bold bg-violet-600 hover:bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] btn-shimmer" loading={loading}>
              Continuar
            </Button>
            
            <div className="mt-4 text-center">
              <Link href="/esqueci-senha" className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-bold tracking-wide">
                Esqueci minha senha
              </Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3 ring-1 ring-emerald-500/30">
                <span className="text-2xl">✉️</span>
              </div>
              <p className="text-sm text-foreground/80">Digite o código de 6 dígitos que acabamos de enviar para <strong>{email}</strong>.</p>
            </div>
            
            <Input label="Código de Acesso" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} placeholder="123456" autoFocus className="text-center text-2xl tracking-[0.5em] font-mono h-14" />
            
            <Button type="submit" className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] btn-shimmer" loading={loading}>
              Verificar e Entrar
            </Button>

            <div className="mt-4 text-center">
              <button type="button" onClick={() => { setStep(1); setCode(""); setAlert(null); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                Voltar e alterar e-mail
              </button>
            </div>
          </div>
        )}
      </form>
    </>
  );
}
