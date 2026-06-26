"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Search, MessageCircle, ShieldCheck, ChevronDown } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export function B2BMarketingSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "A plataforma cobra comissão?", a: "Não. Nós não cobramos taxa sobre suas negociações. Você assina o plano da plataforma e todo o lucro fica com você." },
    { q: "Posso cancelar minha assinatura a qualquer momento?", a: "Sim, nossos planos são mensais e podem ser cancelados a qualquer momento diretamente no painel do lojista, sem multas ou fidelidade." },
    { q: "Como é feita a transação?", a: "Oferecemos segurança total. O cliente entra na sua loja ConectaParts, escolhe o produto, e combina tudo com você com praticidade." },
    { q: "Eu já tenho loja de autopeças, a ConectaParts serve pra mim?", a: "Sim! A ConectaParts é perfeita para digitalizar seu balcão e gerenciar clientes. Tudo integrado ao seu painel." }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 text-center relative z-10">
      {/* DIFERENCIAIS TECNOLÓGICOS */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="mb-24"
      >
        <motion.h2 variants={fadeUp} className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
          A Ferramenta Definitiva para Lojas de Autopeças
        </motion.h2>
        <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground font-medium">
          Esqueça as plataformas genéricas. Nós construímos o sistema perfeito para autopeças, resolvendo as dores reais do seu balcão.
        </motion.p>

        <div className="grid lg:grid-cols-3 gap-12 mt-16 text-left">
          {/* Feature 1: Placa */}
          <motion.div variants={fadeUp} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="glass-panel p-10 rounded-[2.5rem] border border-border-subtle bg-panel/60 relative h-full flex flex-col group-hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-8">
                <Search className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-4">Busca Inteligente por Placa</h3>
              <p className="text-muted-foreground leading-relaxed font-medium flex-1">
                Sem achismos. O cliente não sabe o modelo exato? Ele digita a placa no seu site e nós puxamos a ficha técnica completa do Detran (Marca, Modelo, Ano e Cor) direto pro seu painel.
              </p>
            </div>
          </motion.div>

          {/* Feature 2: Chat */}
          <motion.div variants={fadeUp} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="glass-panel p-10 rounded-[2.5rem] border border-border-subtle bg-panel/60 relative h-full flex flex-col group-hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
                <MessageCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-4">Comunicação Segura</h3>
              <p className="text-muted-foreground leading-relaxed font-medium flex-1">
                Sua loja tem um chat integrado focado em privacidade. Receba os pedidos, alinhe com o cliente e envie ofertas de forma segura, organizando tudo em um só lugar.
              </p>
            </div>
          </motion.div>

          {/* Feature 3: Faturamento */}
          <motion.div variants={fadeUp} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="glass-panel p-10 rounded-[2.5rem] border border-border-subtle bg-panel/60 relative h-full flex flex-col group-hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-8">
                <ShieldCheck className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-4">Conexões Confiáveis</h3>
              <p className="text-muted-foreground leading-relaxed font-medium flex-1">
                Nós criamos a ponte para negócios de longo prazo. Você assina a plataforma, entra em contato com novos clientes com segurança total e mantém a privacidade das informações.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="max-w-3xl mx-auto mb-24 text-left"
      >
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
            Perguntas Frequentes
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              variants={fadeUp}
              className="glass-panel border border-border-subtle rounded-2xl overflow-hidden bg-panel/40"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex items-center justify-between w-full p-6 text-left focus:outline-none"
              >
                <span className="font-bold text-lg text-foreground">{faq.q}</span>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-6 pt-0 text-muted-foreground font-medium leading-relaxed">
                  {faq.a}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CALL TO ACTION */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="glass-panel border border-violet-500/30 rounded-3xl p-12 bg-panel/60 relative overflow-hidden group mb-12"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/10 via-transparent to-indigo-600/10 opacity-50" />
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-black text-foreground mb-4">Expanda suas conexões locais.</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto font-medium">
            Junte-se às melhores lojas de peças do país. Plataforma completa, zero comissões. Comece a criar sua conta abaixo.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
