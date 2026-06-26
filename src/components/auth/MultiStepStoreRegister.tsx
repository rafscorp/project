"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { slugify } from "@/lib/utils/format";
import { ArrowRight, CheckCircle2, ChevronLeft, Store } from "lucide-react";

type FormState = {
  // Step 1
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  password: string;
  // Step 2
  verificationToken: string;
  // Step 3
  storeName: string;
  slug: string;
  cnpj: string;
  phone: string;
  email: string;
  // Step 4
  zipCode: string;
  address: string;
  city: string;
  state: string;
  // Step 5
  planSlug: string;
};

const initialForm = (defaultPlan: string): FormState => ({
  ownerName: "", ownerEmail: "", ownerPhone: "", password: "",
  verificationToken: "",
  storeName: "", slug: "", cnpj: "", phone: "", email: "",
  zipCode: "", address: "", city: "", state: "SP",
  planSlug: defaultPlan,
});

export function MultiStepStoreRegister({ plans }: { plans: { slug: string; name: string; priceMonthly: number }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultPlan = searchParams.get("plan") || "starter";

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm(defaultPlan));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof FormState, value: string) => {
    setForm(f => {
      const next = { ...f, [field]: value };
      if (field === "storeName" && !f.slug) next.slug = slugify(value);
      return next;
    });
    setError(null);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // Enviar código de verificação
  const handleSendCode = async () => {
    if (!form.ownerName || !form.ownerEmail || !form.password) {
      setError("Preencha os campos obrigatórios para avançar.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.ownerEmail })
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

  const handleVerifyCode = () => {
    if (form.verificationToken.length !== 6) {
      setError("Digite o código de 6 dígitos.");
      return;
    }
    // Apenas avança, a validação real será no submit final
    nextStep();
  };

  const buscarCep = async () => {
    const cep = form.zipCode.replace(/\D/g, "");
    if (cep.length !== 8) return;
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
    } catch {
      // ignore
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "store", ...form })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      router.push(data.data.redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar loja.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto glass-panel p-8 sm:p-12 rounded-[2rem] relative overflow-hidden">
      
      {/* Progress */}
      <div className="flex gap-2 mb-10">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step >= i ? "bg-violet-500" : "bg-zinc-800"}`} />
        ))}
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* PASSO 1: CONTA */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Sua Conta</h2>
            <p className="text-muted-foreground mb-8">Como vamos te chamar e como você fará login.</p>
            
            <div className="space-y-4">
              <Input label="Seu Nome" value={form.ownerName} onChange={e => update("ownerName", e.target.value)} required />
              <Input label="E-mail Pessoal" type="email" value={form.ownerEmail} onChange={e => update("ownerEmail", e.target.value)} required />
              <Input label="Telefone / WhatsApp" value={form.ownerPhone} onChange={e => update("ownerPhone", e.target.value)} required />
              <Input label="Crie uma Senha" type="password" value={form.password} onChange={e => update("password", e.target.value)} required />
              
              <Button size="lg" className="w-full mt-6 bg-violet-600 hover:bg-violet-500 text-white rounded-xl" loading={loading} onClick={handleSendCode}>
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* PASSO 2: VERIFICAÇÃO */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={prevStep} className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
            </button>
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Verifique seu e-mail</h2>
            <p className="text-muted-foreground mb-8">Enviamos um código de 6 dígitos para <strong className="text-zinc-200">{form.ownerEmail}</strong>.</p>
            
            <div className="space-y-4">
              <Input 
                label="Código de Verificação" 
                placeholder="000000" 
                value={form.verificationToken} 
                onChange={e => update("verificationToken", e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-2xl tracking-[0.5em] font-mono"
              />
              
              <Button size="lg" className="w-full mt-6 bg-violet-600 hover:bg-violet-500 text-white rounded-xl" onClick={handleVerifyCode}>
                Verificar Código <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* PASSO 3: LOJA */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={prevStep} className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
            </button>
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Detalhes da Loja</h2>
            <p className="text-muted-foreground mb-8">Apresente sua marca para o mercado.</p>
            
            <div className="space-y-4">
              <Input label="CNPJ" value={form.cnpj} onChange={e => update("cnpj", e.target.value)} placeholder="00.000.000/0001-00" />
              <Input label="Nome da Loja" value={form.storeName} onChange={e => update("storeName", e.target.value)} required />
              <Input label="E-mail da Loja" type="email" value={form.email} onChange={e => update("email", e.target.value)} required />
              <Input label="Telefone da Loja" value={form.phone} onChange={e => update("phone", e.target.value)} required />
              <Input label="URL da Loja" value={form.slug} onChange={e => update("slug", slugify(e.target.value))} placeholder="minha-loja" required />
              
              <Button size="lg" className="w-full mt-6 bg-violet-600 hover:bg-violet-500 text-white rounded-xl" onClick={nextStep}>
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* PASSO 4: ENDEREÇO */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={prevStep} className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
            </button>
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Localização</h2>
            <p className="text-muted-foreground mb-8">Para os clientes conseguirem chegar até você ou calcular o frete.</p>
            
            <div className="space-y-4">
              <Input label="CEP" value={form.zipCode} onChange={e => update("zipCode", e.target.value)} onBlur={buscarCep} placeholder="00000-000" />
              <Input label="Endereço Físico" value={form.address} onChange={e => update("address", e.target.value)} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Cidade" value={form.city} onChange={e => update("city", e.target.value)} required />
                <Input label="Estado (UF)" value={form.state} onChange={e => update("state", e.target.value)} maxLength={2} required />
              </div>
              
              <Button size="lg" className="w-full mt-6 bg-violet-600 hover:bg-violet-500 text-white rounded-xl" onClick={nextStep}>
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* PASSO 5: PLANO E FINALIZAR */}
        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={prevStep} className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
            </button>
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Quase lá!</h2>
            <p className="text-muted-foreground mb-8">Confirme o plano escolhido para iniciar.</p>
            
            <div className="space-y-4">
              <div className="grid gap-3">
                {plans.map(p => (
                  <label key={p.slug} className={`cursor-pointer rounded-2xl border p-5 transition-all ${form.planSlug === p.slug ? "border-violet-500 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]" : "border-border-subtle bg-panel/50 hover:bg-zinc-800"}`}>
                    <input type="radio" name="plan" value={p.slug} checked={form.planSlug === p.slug} onChange={() => update("planSlug", p.slug)} className="sr-only" />
                    <div className="flex justify-between items-center">
                      <p className={`font-bold text-lg ${form.planSlug === p.slug ? "text-violet-400" : "text-foreground/80"}`}>{p.name}</p>
                      <p className="text-muted-foreground">R$ {p.priceMonthly}/mês</p>
                    </div>
                  </label>
                ))}
              </div>
              
              <Button size="lg" className="w-full mt-6 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]" onClick={handleSubmit} loading={loading}>
                Criar Minha Loja <Store className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
