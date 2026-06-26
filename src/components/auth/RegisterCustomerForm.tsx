"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type FormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

type AlertState = { type: "error" | "success"; message: string } | null;

const initialForm: FormState = { name: "", email: "", phone: "", password: "" };

function validateField(field: keyof FormState, value: string) {
  switch (field) {
    case "name":
      if (!value.trim()) return "Informe seu nome para continuar.";
      if (value.trim().length < 2) return "Nome muito curto.";
      return "";
    case "email":
      if (!value.trim()) return "Informe um e-mail válido.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "O e-mail precisa ter um formato válido.";
      return "";
    case "phone":
      if (!value.trim()) return "Informe seu telefone.";
      if (value.replace(/\D/g, "").length < 8) return "Telefone muito curto.";
      return "";
    case "password":
      if (!value) return "Crie uma senha com pelo menos 6 caracteres.";
      if (value.length < 6) return "A senha precisa ter no mínimo 6 caracteres.";
      return "";
    default:
      return "";
  }
}

export function RegisterCustomerForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

  function updateField(field: keyof FormState, value: string) {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    if (alert) setAlert(null);
  }

  function handleBlur(field: keyof FormState) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function validateForm(values: FormState) {
    const nextErrors: FormErrors = {
      name: validateField("name", values.name),
      email: validateField("email", values.email),
      phone: validateField("phone", values.phone),
      password: validateField("password", values.password),
    };
    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAlert(null);

    if (!validateForm(form)) {
      setAlert({ type: "error", message: "Revise os campos destacados para continuar." });
      setTouched({ name: true, email: true, phone: true, password: true });
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "customer", ...form }),
    });

    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      setAlert({ type: "error", message: json.error || "Não foi possível criar a conta agora." });
      return;
    }

    setAlert({ type: "success", message: "Conta criada com sucesso! Redirecionando..." });
    router.push(json.data.redirect);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {alert && (
        <div className={`rounded-2xl border p-3 text-sm ${alert.type === "error" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>
          <p className="font-semibold">{alert.type === "error" ? "Ajuste os campos" : "Tudo certo"}</p>
          <p className="mt-1">{alert.message}</p>
        </div>
      )}
      <Input
        label="Nome"
        value={form.name}
        onChange={(e) => updateField("name", e.target.value)}
        onBlur={() => handleBlur("name")}
        error={touched.name ? errors.name : undefined}
        successMessage={touched.name && !errors.name && form.name ? "Nome pronto" : undefined}
        required
      />
      <Input
        label="E-mail"
        type="email"
        value={form.email}
        onChange={(e) => updateField("email", e.target.value)}
        onBlur={() => handleBlur("email")}
        error={touched.email ? errors.email : undefined}
        successMessage={touched.email && !errors.email && form.email ? "E-mail válido" : undefined}
        required
      />
      <Input
        label="Telefone"
        value={form.phone}
        onChange={(e) => updateField("phone", e.target.value)}
        onBlur={() => handleBlur("phone")}
        error={touched.phone ? errors.phone : undefined}
        successMessage={touched.phone && !errors.phone && form.phone ? "Telefone válido" : undefined}
        required
      />
      <Input
        label="Senha"
        type="password"
        value={form.password}
        onChange={(e) => updateField("password", e.target.value)}
        onBlur={() => handleBlur("password")}
        error={touched.password ? errors.password : undefined}
        successMessage={touched.password && !errors.password && form.password ? "Senha forte o suficiente" : undefined}
        required
        minLength={6}
      />
      <Button type="submit" className="w-full" loading={loading}>Criar conta</Button>
      <p className="text-center text-sm text-muted-foreground">
        Já tem conta? <Link href="/login" className="text-amber-400">Entrar</Link>
      </p>
    </form>
  );
}
