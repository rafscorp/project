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
    galleryUrls?: any;
    latitude?: number | null;
    longitude?: number | null;
  };
}

export function StoreSettingsForm({ store }: StoreSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
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
    galleryUrls: (store.galleryUrls as string[]) || [],
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
      galleryUrls: (store.galleryUrls as string[]) || [],
    }));
  }, [store]);

  async function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cep = e.target.value.replace(/\D/g, "");
    setForm(f => ({ ...f, zipCode: e.target.value }));
    
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm(f => ({
            ...f,
            address: data.logradouro,
            city: data.localidade,
            state: data.uf
          }));
        }
      } catch (err) {
        // ignore
      }
    }
  }

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

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingGallery(true);
    setError("");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, folder: "gallery" })
      });

      if (!res.ok) throw new Error("Falha ao preparar upload.");
      
      const { signedUrl, publicUrl } = await res.json();

      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Falha no upload para o storage.");

      setForm((f) => ({ ...f, galleryUrls: [...f.galleryUrls, publicUrl] }));
      setSuccess("Foto adicionada com sucesso! Lembre-se de salvar.");
    } catch (err: any) {
      setError(err.message || "Erro no upload da foto.");
    } finally {
      setUploadingGallery(false);
    }
  }

  function removeGalleryImage(index: number) {
    setForm(f => {
      const newUrls = [...f.galleryUrls];
      newUrls.splice(index, 1);
      return { ...f, galleryUrls: newUrls };
    });
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
              <Input label="CEP" value={form.zipCode} onChange={handleCepChange} placeholder="01310-100" />
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

            <div className="space-y-2 pt-4 border-t border-border-subtle">
              <label className="text-sm font-medium text-foreground">Fotos da Vitrine</label>
              <p className="text-xs text-muted-foreground">Adicione fotos da frente da sua loja e do interior para atrair mais clientes.</p>
              
              <div className="flex flex-wrap gap-4 mt-2">
                {form.galleryUrls.map((url: string, idx: number) => (
                  <div key={idx} className="relative group w-24 h-24 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                    <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="text-[10px] font-bold">X</span>
                    </button>
                  </div>
                ))}
                
                <label className="flex flex-col items-center justify-center w-24 h-24 bg-zinc-800 hover:bg-zinc-700 border border-dashed border-zinc-600 rounded-lg cursor-pointer transition-colors">
                  {uploadingGallery ? <Loader2 className="w-5 h-5 animate-spin text-zinc-400" /> : <UploadCloud className="w-5 h-5 text-zinc-400" />}
                  <span className="text-[10px] text-zinc-400 font-bold mt-1">Adicionar</span>
                  <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleGalleryUpload} disabled={uploadingGallery} />
                </label>
              </div>
            </div>

            <Button type="submit" loading={loading}>Salvar configurações</Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">Slug:</span> <span className="text-amber-400">/loja/{store.slug}</span></div>
            <div><span className="text-muted-foreground">Endereço:</span> <span className="text-foreground">{form.address}, {form.city}/{form.state}</span></div>
            <div><span className="text-muted-foreground">Localização:</span> <span className="text-foreground">Calculada automaticamente a partir do endereço</span></div>
          </CardBody>
        </Card>
      </form>
    </div>
  );
}
