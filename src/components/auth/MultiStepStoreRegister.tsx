"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput, evaluatePassword } from "@/components/ui/PasswordInput";
import { slugify } from "@/lib/utils/format";
import { ArrowRight, ChevronLeft, Store, ShieldCheck, Zap, HelpCircle } from "lucide-react";

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
};

const initialForm: FormState = {
  ownerName: "", ownerEmail: "", ownerPhone: "", password: "",
  verificationToken: "",
  storeName: "", slug: "", cnpj: "", phone: "", email: "",
  zipCode: "", address: "", city: "", state: "SP",
};

export function MultiStepStoreRegister() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
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

  const handleSendCode = async () => {
    if (!form.ownerName || !form.ownerEmail || !form.password) {
      setError("Preencha os campos obrigatórios para avançar.");
      return;
    }
    
    if (evaluatePassword(form.password) === "weak") {
      setError("Sua senha é muito fraca. Digite pelo menos 6 caracteres.");
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
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
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
              <PasswordInput label="Crie uma Senha" value={form.password} onChange={e => update("password", e.target.value)} required />
              
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

        {/* PASSO 5: ONBOARDING - BEM-VINDO E RECURSOS */}
        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="text-center mb-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10 mb-4">
                <Zap className="h-8 w-8 text-violet-500" />
              </div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">Como a Agury funciona?</h2>
              <p className="text-muted-foreground">Entenda o poder que está prestes a colocar nas suas mãos.</p>
            </div>
            
            <div className="space-y-6 mb-8 text-left">
              <div className="flex gap-4 items-start">
                <div className="mt-1 bg-zinc-800 p-2 rounded-lg text-white"><Store className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">Seu Próprio E-commerce</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">Você terá uma vitrine exclusiva (agury.com.br/loja/{form.slug || 'sua-loja'}). Clientes podem buscar suas peças de forma inteligente e comprar direto de você.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 bg-zinc-800 p-2 rounded-lg text-white"><ShieldCheck className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">Gestão Segura</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">Pedidos, pagamentos e comunicação com o cliente centralizados em um único painel profissional, abandonando as planilhas desorganizadas.</p>
                </div>
              </div>
            </div>

            <Button size="lg" className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl" onClick={nextStep}>
              Entendi, próximo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* PASSO 6: ONBOARDING - FAQs IMPORTANTES */}
        {step === 6 && (
          <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={prevStep} className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
            </button>
            <div className="text-center mb-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 mb-4">
                <HelpCircle className="h-8 w-8 text-amber-500" />
              </div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">Dúvidas Frequentes</h2>
              <p className="text-muted-foreground">O que você precisa saber antes de iniciar.</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="bg-panel/50 border border-border-subtle p-4 rounded-xl">
                <h4 className="font-bold text-foreground mb-1">Preciso pagar agora para criar a conta?</h4>
                <p className="text-muted-foreground text-sm">Não. Sua conta será criada no Modo Vitrine. Você poderá navegar pelo painel, ver como ele funciona, mas precisará assinar um plano para começar a vender.</p>
              </div>
              <div className="bg-panel/50 border border-border-subtle p-4 rounded-xl">
                <h4 className="font-bold text-foreground mb-1">Como escolho o meu plano?</h4>
                <p className="text-muted-foreground text-sm">Assim que você acessar o painel pela primeira vez, haverá um aviso indicando que sua loja está inativa, com um botão para visualizar e contratar o melhor plano para o seu tamanho.</p>
              </div>
            </div>

            <Button size="lg" className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl" onClick={nextStep}>
              Estou pronto <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* PASSO 7: FINALIZAR */}
        {step === 7 && (
          <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={prevStep} className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
            </button>
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Tudo Pronto!</h2>
            <p className="text-muted-foreground mb-8">Sua loja será criada e enviaremos os dados para o seu e-mail.</p>
            
            <div className="bg-violet-500/10 border border-violet-500/20 p-6 rounded-2xl mb-8 text-center">
              <Store className="h-12 w-12 text-violet-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{form.storeName || "Sua Loja"}</h3>
              <p className="text-muted-foreground">Você entrará diretamente no painel no <strong>Modo Vitrine</strong>.</p>
            </div>
            
            <Button size="lg" className="w-full mt-6 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]" onClick={handleSubmit} loading={loading}>
              Criar Minha Loja <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

