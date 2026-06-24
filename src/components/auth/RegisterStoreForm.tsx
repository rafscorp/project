"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { slugify } from "@/lib/utils/format";

export function RegisterStoreForm({ plans }: { plans: { slug: string; name: string; priceMonthly: number }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultPlan = searchParams.get("plan") || "starter";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [form, setForm] = useState({
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

  function update(field: string, value: string) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "storeName" && !f.slug) next.slug = slugify(value);
      return next;
    });
  }

  useEffect(() => {
    if (form.slug) {
      setForm((f) => ({ ...f, slug: slugify(f.slug) }));
    }
  }, [form.slug]);

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
      setError("Não foi possível buscar o CEP automaticamente.");
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "store", ...form }),
    });

    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      setError(json.error);
      return;
    }

    setSuccess(`Cadastro criado com sucesso. Seu código de acesso é ${json.data.accessCode}. Use esse código no login para entrar.`);
    router.push(json.data.redirect);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">{success}</div>}

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wider text-amber-400">Responsável</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nome" value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} required />
          <Input label="E-mail" type="email" value={form.ownerEmail} onChange={(e) => update("ownerEmail", e.target.value)} required />
          <Input label="Telefone" value={form.ownerPhone} onChange={(e) => update("ownerPhone", e.target.value)} required />
          <Input label="Senha" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={6} />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wider text-amber-400">Sua Loja</legend>
        <Input label="Nome da loja" value={form.storeName} onChange={(e) => update("storeName", e.target.value)} required />
        <Input label="Endereço da loja online" value={form.slug} onChange={(e) => update("slug", e.target.value)} required
          placeholder="minha-oficina" />
        <p className="text-xs text-zinc-500">Sua loja: /loja/{form.slug || "minha-oficina"}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="CNPJ" value={form.cnpj} onChange={(e) => update("cnpj", e.target.value)} placeholder="00.000.000/0000-00" />
          <Input label="Telefone da loja" value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
          <Input label="E-mail da loja" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          <Input label="CEP" value={form.zipCode} onChange={(e) => update("zipCode", e.target.value)} placeholder="01310-100" onBlur={(e) => buscarCep(e.target.value)} />
          <Input label="Endereço físico" value={form.address} onChange={(e) => update("address", e.target.value)} required />
          <Input label="Cidade" value={form.city} onChange={(e) => update("city", e.target.value)} required />
          <Input label="Estado (UF)" value={form.state} onChange={(e) => update("state", e.target.value)} required maxLength={2} />
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
