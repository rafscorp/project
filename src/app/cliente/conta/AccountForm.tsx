"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface AccountFormProps {
  initialData: {
    name: string;
    phone: string;
  };
}

export function AccountForm({ initialData }: AccountFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simula uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Ocorreu um erro ao atualizar os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground">Nome Completo</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full bg-zinc-900/50 border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground">Celular (WhatsApp)</label>
          <input 
            type="text" 
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="(11) 99999-9999"
            className="w-full bg-zinc-900/50 border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-colors w-full sm:w-auto"
      >
        {loading ? "Salvando..." : "Salvar Alterações"}
      </button>
    </form>
  );
}
