"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateProfile } from "@/app/actions/profile";
import toast from "react-hot-toast";
import { User, Camera } from "lucide-react";

interface UserProfile {
  name: string;
  username: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
}

export function PerfilForm({ user }: { user: UserProfile }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    username: user.username,
    phone: user.phone || "",
    avatarUrl: user.avatarUrl || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.username) {
      toast.error("Nome e Username são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const res = await updateProfile(form);
      if (res.success) {
        toast.success("Perfil atualizado com sucesso!");
      } else {
        toast.error(res.error || "Erro ao salvar perfil.");
      }
    } catch {
      toast.error("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-6 pb-6 border-b border-border-subtle">
        <div className="relative group">
          {form.avatarUrl ? (
            <img 
              src={form.avatarUrl} 
              alt={form.name} 
              className="w-24 h-24 rounded-full object-cover border border-border-subtle" 
              onError={() => setForm(f => ({ ...f, avatarUrl: "" }))}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-zinc-900 border border-border-subtle flex items-center justify-center text-zinc-600">
              <User className="w-10 h-10" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-foreground/80">URL da Foto de Perfil</label>
          <Input 
            value={form.avatarUrl} 
            onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))} 
            placeholder="https://exemplo.com/sua-foto.jpg"
          />
          <p className="text-xs text-muted-foreground">Insira uma URL pública da sua imagem.</p>
        </div>
      </div>

      {/* Profile Form Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input 
          label="Nome Completo" 
          value={form.name} 
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
          required 
        />
        <Input 
          label="Username" 
          value={form.username} 
          onChange={e => setForm(f => ({ ...f, username: e.target.value.replace(/[^a-z0-9_-]/i, "") }))} 
          required 
        />
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium text-foreground/80">E-mail (Inalterável)</label>
          <Input 
            value={user.email} 
            disabled 
            className="cursor-not-allowed bg-panel/50 text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground">E-mail não pode ser alterado por motivos de segurança.</p>
        </div>
        <Input 
          label="Telefone / WhatsApp" 
          value={form.phone} 
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
          placeholder="(00) 00000-0000" 
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-border-subtle">
        <Button type="submit" loading={loading}>Salvar Alterações</Button>
      </div>
    </form>
  );
}
