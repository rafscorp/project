"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight, ChevronLeft, UserCircle } from "lucide-react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  verificationToken: string;
};

const initialForm: FormState = {
  name: "", email: "", phone: "", password: "", verificationToken: ""
};

export function MultiStepCustomerRegister() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof FormState, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setError(null);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // Enviar código de verificação
  const handleSendCode = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Preencha os campos obrigatórios para avançar.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      nextStep();
    } catch (err: any) {
      setError(err.message || "Erro ao enviar código.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (form.verificationToken.length !== 6) {
      setError("Digite o código de 6 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "customer", ...form })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      router.push(data.data.redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto glass-panel p-8 sm:p-12 rounded-[2rem] relative overflow-hidden border-blue-500/20">
      
      {/* Progress */}
      <div className="flex gap-2 mb-10">
        {[1, 2].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step >= i ? "bg-blue-500" : "bg-zinc-800"}`} />
        ))}
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* PASSO 1: DADOS */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-3xl font-display font-bold text-white mb-2">Criar Conta</h2>
            <p className="text-zinc-400 mb-8">Encontre oficinas, gerencie seus veículos e histórico de manutenções.</p>
            
            <div className="space-y-4">
              <Input label="Seu Nome" value={form.name} onChange={e => update("name", e.target.value)} required />
              <Input label="E-mail" type="email" value={form.email} onChange={e => update("email", e.target.value)} required />
              <Input label="Telefone / WhatsApp (Opcional)" value={form.phone} onChange={e => update("phone", e.target.value)} />
              <Input label="Crie uma Senha" type="password" value={form.password} onChange={e => update("password", e.target.value)} required />
              
              <Button size="lg" className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl" loading={loading} onClick={handleSendCode}>
                Avançar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* PASSO 2: VERIFICAÇÃO */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={prevStep} className="flex items-center text-zinc-500 hover:text-white mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
            </button>
            <h2 className="text-3xl font-display font-bold text-white mb-2">Verifique seu e-mail</h2>
            <p className="text-zinc-400 mb-8">Enviamos um código de 6 dígitos para <strong className="text-zinc-200">{form.email}</strong>.</p>
            
            <div className="space-y-4">
              <Input 
                label="Código de Verificação" 
                placeholder="000000" 
                value={form.verificationToken} 
                onChange={e => update("verificationToken", e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-2xl tracking-[0.5em] font-mono"
              />
              
              <Button size="lg" className="w-full mt-6 glow-button bg-blue-600 hover:bg-blue-500 text-white rounded-xl" onClick={handleSubmit} loading={loading}>
                Finalizar Cadastro <UserCircle className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
