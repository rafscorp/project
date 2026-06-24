"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface StoreSettingsFormProps {
  store: {
    id: string;
    name: string;
    slug: string;
    cnpj?: string | null;
    address: string;
    city: string;
    state: string;
    zipCode?: string | null;
    phone: string;
    email: string;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
}

export function StoreSettingsForm({ store }: StoreSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: store.name,
    description: store.description || "",
    phone: store.phone,
    email: store.email,
    address: store.address,
    city: store.city,
    state: store.state,
    zipCode: store.zipCode || "",
    logoUrl: store.logoUrl || "",
    bannerUrl: store.bannerUrl || "",
    latitude: store.latitude?.toString() || "",
    longitude: store.longitude?.toString() || "",
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: store.name,
      phone: store.phone,
      email: store.email,
      address: store.address,
      city: store.city,
      state: store.state,
      zipCode: store.zipCode || "",
      logoUrl: store.logoUrl || "",
      bannerUrl: store.bannerUrl || "",
      latitude: store.latitude?.toString() || "",
      longitude: store.longitude?.toString() || "",
    }));
  }, [store]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/store/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      setError(json.error || "Não foi possível salvar.");
      return;
    }

    setSuccess("Perfil da loja atualizado com sucesso.");
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
        {success && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">{success}</div>}

        <Card>
          <CardBody className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Nome da loja" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              <Input label="Slug" value={store.slug} readOnly />
              <Input label="CNPJ" value={store.cnpj || ""} readOnly />
              <Input label="Telefone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
              <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              <Input label="CEP" value={form.zipCode} onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))} placeholder="01310-100" />
            </div>
            <Input label="Descrição" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <Input label="Endereço" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} required />
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Cidade" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required />
              <Input label="Estado (UF)" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value.toUpperCase() }))} maxLength={2} required />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="URL da logo" value={form.logoUrl} onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))} placeholder="https://..." />
              <Input label="URL da foto da loja" value={form.bannerUrl} onChange={(e) => setForm((f) => ({ ...f, bannerUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Latitude" value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} placeholder="-23.5505" />
              <Input label="Longitude" value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} placeholder="-46.6333" />
            </div>
            <Button type="submit" loading={loading}>Salvar configurações</Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3 text-sm">
            <div><span className="text-zinc-500">Slug:</span> <span className="text-amber-400">/loja/{store.slug}</span></div>
            <div><span className="text-zinc-500">Endereço:</span> <span className="text-white">{form.address}, {form.city}/{form.state}</span></div>
            <div><span className="text-zinc-500">Mapa:</span> <span className="text-white">{form.latitude && form.longitude ? "Localização salva" : "Adicione latitude/longitude para exibir no mapa"}</span></div>
            {form.latitude && form.longitude && (
              <div className="mt-3 overflow-hidden rounded-xl border border-zinc-800">
                <iframe
                  title="Mapa da loja"
                  src={`https://www.google.com/maps?q=${form.latitude},${form.longitude}&z=15&output=embed`}
                  className="h-60 w-full"
                />
              </div>
            )}
          </CardBody>
        </Card>
      </form>
    </div>
  );
}
