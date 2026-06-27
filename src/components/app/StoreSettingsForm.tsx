"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UploadCloud, Loader2 } from "lucide-react";

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
  const [uploadingLogo, setUploadingLogo] = useState(false);
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

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setError("");

    try {
      // 1. Pegar Pre-signed URL da API
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: "stores"
        })
      });

      if (!res.ok) throw new Error("Falha ao preparar upload.");
      
      const { signedUrl, publicUrl } = await res.json();

      // 2. Fazer Upload Direto pro R2/S3
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Falha no upload para o storage.");

      // 3. Salvar URL no formulário
      setForm((f) => ({ ...f, logoUrl: publicUrl }));
      setSuccess("Logo enviada com sucesso! Lembre-se de salvar as configurações.");
    } catch (err: any) {
      setError(err.message || "Erro no upload da logo.");
    } finally {
      setUploadingLogo(false);
    }
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
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Logo da Loja</label>
                <div className="flex items-center gap-4">
                  {form.logoUrl && (
                    <img src={form.logoUrl} alt="Logo" className="w-12 h-12 rounded-lg object-cover bg-zinc-800" />
                  )}
                  <label className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors border border-border-subtle">
                    {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    {uploadingLogo ? "Enviando..." : "Enviar Logo"}
                    <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                  </label>
                </div>
              </div>
              <Input label="URL da foto da loja (Banner)" value={form.bannerUrl} onChange={(e) => setForm((f) => ({ ...f, bannerUrl: e.target.value }))} placeholder="https://..." />
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
            <div><span className="text-muted-foreground">Slug:</span> <span className="text-amber-400">/loja/{store.slug}</span></div>
            <div><span className="text-muted-foreground">Endereço:</span> <span className="text-foreground">{form.address}, {form.city}/{form.state}</span></div>
            <div><span className="text-muted-foreground">Mapa:</span> <span className="text-foreground">{form.latitude && form.longitude ? "Localização salva" : "Adicione latitude/longitude para exibir no mapa"}</span></div>
            {form.latitude && form.longitude && (
              <div className="mt-3 overflow-hidden rounded-xl border border-border-subtle">
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
