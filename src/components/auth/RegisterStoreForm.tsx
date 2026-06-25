"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { slugify } from "@/lib/utils/format";

type AlertState = { type: "error" | "success"; message: string } | null;

type FormState = {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  password: string;
  storeName: string;
  slug: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  planSlug: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm = (defaultPlan: string): FormState => ({
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  password: "",
  storeName: "",
  slug: "",
  cnpj: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "SP",
  zipCode: "",
  planSlug: defaultPlan,
});

function validateField(field: keyof FormState, value: string) {
  switch (field) {
    case "ownerName":
    case "storeName":
      if (!value.trim()) return "Este campo é obrigatório.";
      if (value.trim().length < 2) return "Informe um nome mais completo.";
      return "";
    case "ownerEmail":
    case "email":
      if (!value.trim()) return "Informe um e-mail válido.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "O e-mail precisa ter um formato válido.";
      return "";
    case "ownerPhone":
    case "phone":
      if (!value.trim()) return "Informe um telefone.";
      if (value.replace(/\D/g, "").length < 8) return "Telefone muito curto.";
      return "";
    case "password":
      if (!value) return "Crie uma senha com pelo menos 6 caracteres.";
      if (value.length < 6) return "A senha precisa ter no mínimo 6 caracteres.";
      return "";
    case "slug":
      if (!value.trim()) return "Defina um endereço para sua loja.";
      if (!/^[a-z0-9-]+$/.test(value)) return "Use apenas letras minúsculas, números e hífens.";
      return "";
    case "address":
    case "city":
      if (!value.trim()) return "Preencha esse campo para continuar.";
      return "";
    case "state":
      if (!value.trim()) return "Informe o estado.";
      return "";
    case "zipCode":
      if (value && value.replace(/\D/g, "").length !== 8) return "CEP inválido.";
      return "";
    default:
      return "";
  }
}

export function RegisterStoreForm({ plans }: { plans: { slug: string; name: string; priceMonthly: number }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultPlan = searchParams.get("plan") || "starter";

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm(defaultPlan));
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

  function update(field: keyof FormState, value: string) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "storeName" && !f.slug) next.slug = slugify(value);
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    if (alert) setAlert(null);
  }

  function handleBlur(field: keyof FormState) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  useEffect(() => {
    if (form.slug) {
      setForm((f) => ({ ...f, slug: slugify(f.slug) }));
    }
  }, [form.slug]);

  function validateForm(values: FormState) {
    const nextErrors: FormErrors = {
      ownerName: validateField("ownerName", values.ownerName),
      ownerEmail: validateField("ownerEmail", values.ownerEmail),
      ownerPhone: validateField("ownerPhone", values.ownerPhone),
      password: validateField("password", values.password),
      storeName: validateField("storeName", values.storeName),
      slug: validateField("slug", values.slug),
      phone: validateField("phone", values.phone),
      email: validateField("email", values.email),
      address: validateField("address", values.address),
      city: validateField("city", values.city),
      state: validateField("state", values.state),
      zipCode: validateField("zipCode", values.zipCode),
    };
    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  }

  async function buscarCep(cep: string) {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((f) => ({
          ...f,
          address: `${data.logradouro || ""}${data.bairro ? `, ${data.bairro}` : ""}`.trim(),
          city: data.localidade || f.city,
          state: data.uf || f.state,
        }));
      }
    } catch {
      setAlert({ type: "error", message: "Não foi possível buscar o CEP automaticamente." });
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAlert(null);

    if (!validateForm(form)) {
      setAlert({ type: "error", message: "Revise os campos destacados para continuar." });
      setTouched({ ownerName: true, ownerEmail: true, ownerPhone: true, password: true, storeName: true, slug: true, phone: true, email: true, address: true, city: true, state: true, zipCode: true });
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "store", ...form }),
    });

    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      setAlert({ type: "error", message: json.error || "Não foi possível criar a loja agora." });
      return;
    }

    setAlert({ type: "success", message: `Cadastro criado com sucesso. Seu código de acesso é ${json.data.accessCode}.` });
    router.push(json.data.redirect);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {alert && (
        <div className={`rounded-2xl border p-3 text-sm ${alert.type === "error" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>
          <p className="font-semibold">{alert.type === "error" ? "Ajuste os campos" : "Tudo certo"}</p>
          <p className="mt-1">{alert.message}</p>
        </div>
      )}

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wider text-amber-400">Responsável</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nome" value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} onBlur={() => handleBlur("ownerName")} error={touched.ownerName ? errors.ownerName : undefined} successMessage={touched.ownerName && !errors.ownerName && form.ownerName ? "Nome pronto" : undefined} required />
          <Input label="E-mail" type="email" value={form.ownerEmail} onChange={(e) => update("ownerEmail", e.target.value)} onBlur={() => handleBlur("ownerEmail")} error={touched.ownerEmail ? errors.ownerEmail : undefined} successMessage={touched.ownerEmail && !errors.ownerEmail && form.ownerEmail ? "E-mail válido" : undefined} required />
          <Input label="Telefone" value={form.ownerPhone} onChange={(e) => update("ownerPhone", e.target.value)} onBlur={() => handleBlur("ownerPhone")} error={touched.ownerPhone ? errors.ownerPhone : undefined} successMessage={touched.ownerPhone && !errors.ownerPhone && form.ownerPhone ? "Telefone válido" : undefined} required />
          <Input label="Senha" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} onBlur={() => handleBlur("password")} error={touched.password ? errors.password : undefined} successMessage={touched.password && !errors.password && form.password ? "Senha forte" : undefined} required minLength={6} />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wider text-amber-400">Sua Loja</legend>
        <Input label="Nome da loja" value={form.storeName} onChange={(e) => update("storeName", e.target.value)} onBlur={() => handleBlur("storeName")} error={touched.storeName ? errors.storeName : undefined} successMessage={touched.storeName && !errors.storeName && form.storeName ? "Nome da loja pronto" : undefined} required />
        <Input label="Endereço da loja online" value={form.slug} onChange={(e) => update("slug", e.target.value)} onBlur={() => handleBlur("slug")} error={touched.slug ? errors.slug : undefined} successMessage={touched.slug && !errors.slug && form.slug ? "Endereço disponível" : undefined} required placeholder="minha-oficina" />
        <p className="text-xs text-zinc-500">Sua loja: /loja/{form.slug || "minha-oficina"}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="CNPJ" value={form.cnpj} onChange={(e) => update("cnpj", e.target.value)} placeholder="00.000.000/0000-00" />
          <Input label="Telefone da loja" value={form.phone} onChange={(e) => update("phone", e.target.value)} onBlur={() => handleBlur("phone")} error={touched.phone ? errors.phone : undefined} successMessage={touched.phone && !errors.phone && form.phone ? "Telefone válido" : undefined} required />
          <Input label="E-mail da loja" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} onBlur={() => handleBlur("email")} error={touched.email ? errors.email : undefined} successMessage={touched.email && !errors.email && form.email ? "E-mail válido" : undefined} required />
          <Input label="CEP" value={form.zipCode} onChange={(e) => update("zipCode", e.target.value)} onBlur={(e) => { handleBlur("zipCode"); buscarCep(e.target.value); }} error={touched.zipCode ? errors.zipCode : undefined} successMessage={touched.zipCode && !errors.zipCode && form.zipCode ? "CEP formatado" : undefined} placeholder="01310-100" />
          <Input label="Endereço físico" value={form.address} onChange={(e) => update("address", e.target.value)} onBlur={() => handleBlur("address")} error={touched.address ? errors.address : undefined} successMessage={touched.address && !errors.address && form.address ? "Endereço ok" : undefined} required />
          <Input label="Cidade" value={form.city} onChange={(e) => update("city", e.target.value)} onBlur={() => handleBlur("city")} error={touched.city ? errors.city : undefined} successMessage={touched.city && !errors.city && form.city ? "Cidade ok" : undefined} required />
          <Input label="Estado (UF)" value={form.state} onChange={(e) => update("state", e.target.value)} onBlur={() => handleBlur("state")} error={touched.state ? errors.state : undefined} successMessage={touched.state && !errors.state && form.state ? "Estado ok" : undefined} required maxLength={2} />
        </div>
        {cepLoading && <p className="text-xs text-amber-400">Buscando endereço pelo CEP...</p>}
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-400">Plano</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {plans.map((p) => (
            <label key={p.slug} className={`cursor-pointer rounded-xl border p-4 transition ${form.planSlug === p.slug ? "border-amber-400 bg-amber-400/10" : "border-zinc-700"}`}>
              <input type="radio" name="plan" value={p.slug} checked={form.planSlug === p.slug} onChange={() => update("planSlug", p.slug)} className="sr-only" />
              <p className="font-semibold text-white">{p.name}</p>
              <p className="text-sm text-amber-400">R$ {p.priceMonthly}/mês</p>
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Criar loja — 14 dias grátis
      </Button>
    </form>
  );
}
