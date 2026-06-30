"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createAdminUser } from "@/app/actions/admin";
import toast from "react-hot-toast";
import { UserPlus, X } from "lucide-react";

export function CreateAdminModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({ name: "", email: "", username: "", password: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.username || !form.password) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const res = await createAdminUser({
        name: form.name,
        email: form.email,
        username: form.username,
        passwordHash: form.password,
      });

      if (res.success) {
        toast.success("Administrador cadastrado com sucesso!");
        handleClose();
      } else {
        toast.error(res.error || "Erro ao cadastrar administrador.");
      }
    } catch {
      toast.error("Erro na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpen} className="bg-violet-600 hover:bg-violet-500 text-white gap-2 rounded-xl">
        <UserPlus className="w-4 h-4" /> Novo Administrador
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl animate-scale-in relative">
            <button 
              onClick={handleClose} 
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-display font-bold text-white">Novo Administrador</h3>
              <p className="text-sm text-zinc-400 mt-1">Conceda acesso administrativo total à plataforma.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nome Completo"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Amanda Silva"
                required
              />
              <Input
                label="E-mail"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="Ex: amanda@agury.com.br"
                required
              />
              <Input
                label="Nome de Usuário (Username)"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))}
                placeholder="Ex: amanda_admin"
                required
              />
              <Input
                label="Senha Inicial"
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
                required
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/60">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" loading={loading} className="bg-white text-zinc-950 hover:bg-zinc-200">
                  Criar Acesso
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
