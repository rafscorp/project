"use client";

import { useState } from "react";
import { UploadCloud, Image as ImageIcon, Save, CheckCircle2, Loader2, Store } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SettingsFormProps {
  initialStore: {
    name: string;
    slug: string;
    phone: string;
    address: string;
    description: string;
    logoUrl: string;
    bannerUrl: string;
  };
}

export function SettingsForm({ initialStore }: SettingsFormProps) {
  const [store, setStore] = useState(initialStore);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "logo") setUploadingLogo(true);
    else setUploadingBanner(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro no upload");
      }

      const { url } = await res.json();
      
      // Salva imediatamente no banco de dados também
      const updateRes = await fetch("/api/stores/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(type === "logo" ? { logoUrl: url } : { bannerUrl: url }),
      });

      if (updateRes.ok) {
        setStore({ ...store, [type === "logo" ? "logoUrl" : "bannerUrl"]: url });
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      if (type === "logo") setUploadingLogo(false);
      else setUploadingBanner(false);
    }
  };

  const handleSaveText = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/stores/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: store.phone,
          address: store.address,
          description: store.description,
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Falha ao salvar as configurações");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* SEÇÃO: IMAGENS */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-zinc-900/40">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center"><ImageIcon className="w-5 h-5 mr-2 text-violet-500"/> Imagens da Loja</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Upload Logo */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-zinc-300 block">Logomarca</label>
            <div className="relative group w-32 h-32 rounded-full border-2 border-dashed border-zinc-700 hover:border-violet-500 bg-zinc-950 flex flex-col items-center justify-center overflow-hidden transition-colors cursor-pointer">
              {uploadingLogo ? (
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              ) : store.logoUrl ? (
                <>
                  <img src={store.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-xs font-bold text-white">Trocar</span>
                  </div>
                </>
              ) : (
                <>
                  <Store className="w-8 h-8 text-zinc-600 mb-2 group-hover:text-violet-500 transition-colors" />
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider group-hover:text-violet-400">Upload</span>
                </>
              )}
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp"
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={(e) => handleUpload(e, "logo")}
                disabled={uploadingLogo}
              />
            </div>
            <p className="text-xs text-zinc-500">Recomendado: Quadrada (500x500px), máx 5MB.</p>
          </div>

          {/* Upload Banner */}
          <div className="md:col-span-2 space-y-3">
            <label className="text-sm font-bold text-zinc-300 block">Capa / Banner da Vitrine</label>
            <div className="relative group w-full h-32 rounded-xl border-2 border-dashed border-zinc-700 hover:border-violet-500 bg-zinc-950 flex flex-col items-center justify-center overflow-hidden transition-colors cursor-pointer">
              {uploadingBanner ? (
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              ) : store.bannerUrl ? (
                <>
                  <img src={store.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-sm font-bold text-white bg-zinc-900/80 px-4 py-2 rounded-lg backdrop-blur flex items-center"><UploadCloud className="w-4 h-4 mr-2"/> Trocar Capa</span>
                  </div>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-zinc-600 mb-2 group-hover:text-violet-500 transition-colors" />
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider group-hover:text-violet-400">Clique para enviar capa</span>
                </>
              )}
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp"
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={(e) => handleUpload(e, "banner")}
                disabled={uploadingBanner}
              />
            </div>
            <p className="text-xs text-zinc-500">Recomendado: Larga (1920x400px), máx 5MB. Aparece no topo da sua vitrine pública.</p>
          </div>
        </div>
      </div>

      {/* SEÇÃO: DADOS DE CONTATO E TEXTO */}
      <form onSubmit={handleSaveText} className="glass-panel p-8 rounded-3xl border border-white/5 bg-zinc-900/40 space-y-6">
        <h2 className="text-xl font-bold text-white mb-6">Informações Públicas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-300">Telefone / WhatsApp</label>
            <input 
              type="text" 
              required
              value={store.phone}
              onChange={e => setStore({...store, phone: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500/50 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-300">Endereço Completo</label>
            <input 
              type="text" 
              required
              value={store.address}
              onChange={e => setStore({...store, address: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-300">Descrição da Loja</label>
          <textarea 
            rows={4}
            value={store.description}
            onChange={e => setStore({...store, description: e.target.value})}
            placeholder="Conte um pouco sobre sua loja, especialidades..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500/50 outline-none transition-all resize-none"
          />
        </div>

        <div className="pt-4 flex items-center gap-4">
          <Button type="submit" disabled={saving} className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 h-12">
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            Salvar Informações
          </Button>
          {success && <span className="text-emerald-400 font-bold text-sm flex items-center animate-in fade-in"><CheckCircle2 className="w-4 h-4 mr-1"/> Salvo!</span>}
        </div>
      </form>
    </div>
  );
}
