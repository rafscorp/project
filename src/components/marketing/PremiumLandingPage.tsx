"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useState, useRef } from "react";
import { 
  CarFront, 
  Store, 
  Car, 
  CheckCircle2, 
  Users, 
  BarChart, 
  ShieldCheck, 
  MessageCircle, 
  ArrowRight, 
  MapPin, 
  Search, 
  Settings, 
  ChevronDown,
  User,
  CreditCard,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TopStoresCarousel } from "./TopStoresCarousel";

interface TopStore {
  id: string;
  name: string;
  slug: string;
  averageRating: number;
  totalReviews: number;
  city: string;
  state: string;
  logoUrl: string | null;
  reviews: Array<{
    comment: string | null;
    rating: number;
    user: { name: string };
  }>;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  features: any;
  sortOrder: number;
}

interface PremiumLandingPageProps {
  topStores: TopStore[];
  plans: SubscriptionPlan[];
  mostChosenPlanId?: string | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function PremiumLandingPage({ topStores, plans, mostChosenPlanId }: PremiumLandingPageProps) {
  const sectionRef = useRef<HTMLElement>(null);
  let topStoresTitle = "Nossas Melhores Lojas";
  if (topStores.length === 1) {
    topStoresTitle = `A Loja Mais Bem Avaliada de ${topStores[0].state || "Nossa Plataforma"}`;
  } else if (topStores.length > 1) {
    topStoresTitle = `Top ${topStores.length} Lojas Mais Bem Avaliadas`;
  }

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showPlans, setShowPlans] = useState(false);

  const faqs = [
    { q: "A plataforma é realmente gratuita?", a: "Sim, 100% gratuita para clientes que estão buscando peças. Você pode fazer quantos orçamentos quiser sem pagar nada." },
    { q: "Como recebo minhas peças?", a: "Após fechar negócio pelo nosso chat, você combina diretamente com a loja. Pode ser retirada no balcão ou entrega na sua oficina/casa." },
    { q: "Meus dados estão seguros?", a: "Totalmente. Nosso chat protege sua privacidade e suas informações só são passadas para a loja quando você decide compartilhar." },
    { q: "Posso comparar preços?", a: "Com certeza! É o nosso forte. Você pode solicitar orçamentos para várias lojas da sua região e escolher a oferta que melhor te atende." }
  ];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      
      {/* Botões Flutuantes: Tema + Login */}
      <div className="fixed top-6 right-6 sm:top-8 sm:right-8 z-50 flex items-center gap-3">
        <ThemeToggle />
        <Link href="/entrar" className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 p-0 rounded-full border-none bg-violet-700 hover:bg-violet-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors shadow-lg hover:scale-105 duration-200 group">
          <User className="h-6 w-6 sm:h-7 sm:w-7 text-white dark:text-zinc-300 group-hover:text-amber-300 dark:group-hover:text-violet-400 transition-colors" />
          <span className="sr-only">Entrar</span>
        </Link>
      </div>

      {/* BACKGROUND GLOBAL */}
      <div className="fixed inset-0 z-0 bg-mesh-dark pointer-events-none hidden sm:block" />
      <div className="fixed inset-0 z-0 bg-grid-dark opacity-40 pointer-events-none hidden sm:block" />
      
      {/* 1. HERO GIGANTE */}
      <motion.section 
        initial={{ opacity: 0, y: 60 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-12 sm:px-6 lg:px-8"
      >
        <motion.div 
          className="text-center w-full max-w-5xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          
          <motion.h1 variants={fadeUp} className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-8xl text-foreground">
            A forma <span className="text-gradient">inteligente</span> de<br className="hidden sm:block" /> se conectar.
          </motion.h1>
          
          <motion.p variants={fadeUp} className="mx-auto mt-8 max-w-2xl text-xl text-foreground/80 leading-relaxed font-medium">
            Seja bem-vindo à ConectaParts. A ponte de altíssima tecnologia que liga quem precisa de soluções automotivas aos melhores lojistas e distribuidores do país.
          </motion.p>
        </motion.div>

        {/* BOTOES GIGANTES (A ESCOLHA) */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mt-16 grid w-full max-w-5xl gap-8 sm:grid-cols-2 relative z-20"
        >
          {/* Card Cliente */}
          <motion.div variants={fadeUp} className="h-full relative group">
            <Link href="/login" className="block h-full relative outline-none">
              <div className="relative flex h-full flex-col sm:flex-row items-center sm:items-start text-center sm:text-left rounded-[2rem] p-8 sm:p-10 transition-all bg-card hover:bg-accent/10 border border-border overflow-hidden shadow-sm hover:shadow-md hover:border-blue-500/30 dark:hover:border-blue-400/50">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 rounded-[2rem] pointer-events-none transition-opacity duration-500" />
                
                <div className="mb-6 sm:mb-0 sm:mr-8 shrink-0 rounded-3xl bg-blue-100 dark:bg-blue-900/30 p-6 shadow-inner ring-1 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all relative overflow-hidden">
                  <User className="h-12 w-12 sm:h-14 sm:w-14 text-blue-600 dark:text-blue-400 relative z-10 transition-transform group-hover:scale-110 duration-500" />
                </div>
                
                <div className="flex-1 flex flex-col items-center sm:items-start z-10">
                  <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-4">Sou Cliente</h2>
                  <p className="text-muted-foreground text-lg mb-8 font-medium leading-relaxed">
                    Ache a peça exata instantaneamente. Conecte-se com os melhores lojistas da região e negocie com total segurança.
                  </p>
                  <div className="mt-auto inline-flex items-center justify-center w-full sm:w-auto font-black text-lg text-white bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1">
                    Entrar na Plataforma <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-2" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Card Lojista */}
          <motion.div variants={fadeUp} className="h-full relative group">
            <div className="block h-full relative outline-none">
              <div className="relative flex h-full flex-col sm:flex-row items-center sm:items-start text-center sm:text-left rounded-[2rem] p-8 sm:p-10 transition-all bg-card hover:bg-accent/10 border border-border overflow-hidden shadow-sm hover:shadow-md hover:border-violet-500/30 dark:hover:border-violet-400/50">
                <div className="absolute inset-0 bg-gradient-to-bl from-violet-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 rounded-[2rem] pointer-events-none transition-opacity duration-500" />
                
                <div className="mb-6 sm:mb-0 sm:mr-8 shrink-0 rounded-3xl bg-violet-100 dark:bg-violet-900/30 p-6 shadow-inner ring-1 ring-violet-500/20 group-hover:ring-violet-500/40 transition-all relative overflow-hidden">
                  <Store className="h-12 w-12 sm:h-14 sm:w-14 text-violet-600 dark:text-violet-400 relative z-10 transition-transform group-hover:scale-110 duration-500" />
                </div>
                
                <div className="flex-1 flex flex-col items-center sm:items-start z-10">
                  <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground mb-4">Sou Lojista</h2>
                  <p className="text-muted-foreground text-lg mb-8 font-medium leading-relaxed">
                    Digitalize o balcão da sua autopeças. Receba pedidos 24h por dia e aumente suas vendas sem complicação.
                  </p>
                  <div className="mt-auto flex flex-col gap-3 w-full relative z-10">
                    <Link 
                      href="/planos"
                      className="inline-flex items-center justify-center font-black text-lg text-white bg-violet-600 hover:bg-violet-500 px-8 py-4 rounded-xl shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1 w-full"
                    >
                      Conhecer Planos <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-2" />
                    </Link>
                    <Link href="/login" className="inline-flex items-center justify-center font-bold text-base text-foreground bg-background hover:bg-muted px-4 py-3 rounded-xl border border-border transition-colors w-full shadow-sm hover:shadow">
                      Já sou parceiro
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
      </motion.section>

      {/* TOP LOJAS */}
      {topStores.length > 0 && (
        <motion.section 
          ref={sectionRef} 
          initial={{ opacity: 0, y: 80 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 py-32 border-t border-border-subtle overflow-hidden"
        >
          <div 
            className="absolute inset-0 z-0 opacity-100"
            style={{
              backgroundImage: "url('/images/imgcar.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center 30%"
            }}
          />
          <div className="absolute inset-0 z-0 bg-white/30 dark:bg-black/70 pointer-events-none" />
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/80 via-transparent to-background/90 pointer-events-none" />
          
          <div 
            className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          >
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center mb-16 flex flex-col items-center"
            >
              <motion.div variants={fadeUp} className="mb-4 inline-flex items-center justify-center p-4 bg-amber-500/10 rounded-full ring-1 ring-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <Star className="h-8 w-8 text-amber-400 fill-amber-400" />
              </motion.div>
              <motion.h2 variants={fadeUp} className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
                {topStoresTitle}
              </motion.h2>
              <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-xl text-foreground/80">
                A qualidade fala por si só. Conheça as lojas de elite aprovadas por milhares de clientes.
              </motion.p>
            </motion.div>
          </div>

          <div className="relative z-10 mt-12 w-full">
            <TopStoresCarousel topStores={topStores} />
          </div>
        </motion.section>
      )}

      {/* DIFERENCIAIS TECNOLÓGICOS (MÁQUINA DE VENDAS B2B) */}
      <motion.section 
        initial={{ opacity: 0, y: 80 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 py-32 border-t border-border-subtle bg-background overflow-hidden"
      >
        {/* Glow de Fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-24"
          >
            <motion.h2 variants={fadeUp} className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
              A Plataforma Definitiva para Encontrar Peças
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground font-medium">
              Esqueça perder horas ligando para autopeças. Nós centralizamos os melhores estoques da sua região na palma da sua mão.
            </motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            
            {/* Feature 1: Placa */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative group"
            >
              <div className="relative p-10 rounded-[2.5rem] border border-border bg-card h-full flex flex-col group-hover:-translate-y-2 transition-transform duration-500 overflow-hidden shadow-sm hover:shadow-md">
                <div className="w-20 h-20 rounded-3xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <Search className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4">Busca Inteligente</h3>
                <p className="text-muted-foreground text-lg leading-relaxed font-medium flex-1">
                  Não sabe o modelo exato da peça? Digite a <span className="text-foreground font-bold">placa do seu carro</span> e nós trazemos a ficha técnica completa do Detran para evitar compras erradas e garantir 100% de precisão.
                </p>
              </div>
            </motion.div>

            {/* Feature 2: Chat FOMO */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative group"
            >
              <div className="relative p-10 rounded-[2.5rem] border border-border bg-card h-full flex flex-col group-hover:-translate-y-2 transition-transform duration-500 overflow-hidden shadow-sm hover:shadow-md">
                <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <MessageCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4">Comunicação Segura</h3>
                <p className="text-muted-foreground text-lg leading-relaxed font-medium flex-1">
                  Negocie direto pelo nosso chat criptografado. Privacidade em primeiro lugar. Tire dúvidas, receba fotos reais das peças e feche negócio sem expor seus dados pessoais.
                </p>
              </div>
            </motion.div>

            {/* Feature 3: Faturamento */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative group"
            >
              <div className="relative p-10 rounded-[2.5rem] border border-border bg-card h-full flex flex-col group-hover:-translate-y-2 transition-transform duration-500 overflow-hidden shadow-sm hover:shadow-md">
                <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4">Conexão Confiável</h3>
                <p className="text-muted-foreground text-lg leading-relaxed font-medium flex-1">
                  A ponte de confiança entre você e o mercado automotivo local. Trabalhamos apenas com lojistas validados para garantir a melhor experiência na sua compra.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.section>

      {/* PLANOS PARA LOJISTAS DINÂMICOS DO BANCO - Ocultos por padrão */}
      {showPlans && (
        <motion.section 
          id="planos-section"
          initial={{ opacity: 0, y: 80 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 py-32 border-t border-border-subtle"
        >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/50 bg-violet-500/10 px-5 py-2 text-sm font-bold text-violet-600 dark:text-violet-300">
              <Store className="h-4 w-4" /> Para Lojas de Autopeças
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
              Planos desenhados para acelerar.
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-xl text-foreground/80 font-medium">
              Escolha o motor ideal para escalar o seu negócio. Nossos planos puxam da base de dados sem intermediários.
            </motion.p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto items-center">
            {plans.map((plan, index) => {
              const isHighlight = index === 1; // Destaca o do meio
              
              const featuresArray = Array.isArray(plan.features) 
                ? plan.features 
                : typeof plan.features === 'string' 
                  ? JSON.parse(plan.features) 
                  : [];

              return (
                <motion.div 
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`${isHighlight ? 'z-10 scale-105' : ''}`}
                >
                  <Link href={`/login?role=store&plan=${plan.slug}`} className="block group h-full">
                    {isHighlight ? (
                      // CARD DESTAQUE
                      <div className="relative p-[2px] rounded-3xl bg-gradient-to-b from-violet-400 to-indigo-600 shadow-[0_0_60px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_80px_rgba(139,92,246,0.7)] transition-shadow h-full">
                        <div className="bg-background rounded-[22px] p-8 h-full relative overflow-hidden group-hover:bg-panel transition-colors flex flex-col">
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                          
                          {mostChosenPlanId === plan.id && (
                            <div className="absolute top-0 right-8 bg-violet-600 text-zinc-50 text-xs font-black px-4 py-1.5 rounded-b-xl shadow-lg transform origin-top">
                              MAIS ESCOLHIDO
                            </div>
                          )}
                          
                          
                          <div className="relative z-10 flex-1 flex flex-col">
                            <h3 className="text-2xl font-black text-violet-400 group-hover:text-violet-300">{plan.name}</h3>
                            <div className="mt-4 flex items-baseline text-5xl font-black text-foreground">
                              <span className="text-2xl text-muted-foreground mr-1">R$</span>
                              {plan.priceMonthly.toString().replace('.', ',')}
                              <span className="ml-2 text-xl font-bold text-muted-foreground">/mês</span>
                            </div>
                            <p className="mt-4 text-foreground/80 font-medium">{plan.description}</p>
                            <ul className="mt-8 space-y-4 mb-8 flex-1">
                              {featuresArray.map((feat: string) => (
                                <li key={feat} className="flex items-center text-foreground font-medium text-lg">
                                  <CheckCircle2 className="h-6 w-6 text-violet-400 shrink-0 mr-3" />
                                  <span className="text-foreground/80 font-medium">{feat}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="w-full mt-auto flex items-center justify-center h-16 bg-violet-600 text-zinc-50 font-black text-xl rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.4)] group-hover:bg-violet-500 group-hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-all btn-shimmer">
                              <span className="relative z-20">Assinar {plan.name} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform inline" /></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // CARD NORMAL
                      <div className="relative bg-panel rounded-3xl p-8 h-full border border-border-subtle hover:border-border-subtle hover:bg-panel-hover transition-colors flex flex-col hover:-translate-y-2 duration-300">
                        {mostChosenPlanId === plan.id && (
                          <div className="absolute top-0 right-8 bg-violet-600 text-zinc-50 text-xs font-black px-4 py-1.5 rounded-b-xl shadow-lg transform origin-top">
                            MAIS ESCOLHIDO
                          </div>
                        )}
                        <h3 className="text-2xl font-black text-foreground mt-2">{plan.name}</h3>
                        <div className="mt-4 flex items-baseline text-5xl font-extrabold text-foreground">
                          <span className="text-2xl text-muted-foreground mr-1">R$</span>
                          {plan.priceMonthly.toString().replace('.', ',')}
                          <span className="ml-2 text-xl font-medium text-muted-foreground">/mês</span>
                        </div>
                        <p className="mt-4 text-foreground/80 font-medium">{plan.description}</p>
                        <ul className="mt-8 space-y-4 mb-8 flex-1">
                          {featuresArray.map((feature: string) => (
                            <li key={feature} className="flex items-center text-foreground/80 font-medium text-lg">
                              <CheckCircle2 className="h-6 w-6 text-muted-foreground mr-3 shrink-0" /> {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-8 w-full py-4 rounded-xl font-bold text-center border-2 border-border-subtle text-foreground group-hover:border-violet-500/50 group-hover:bg-violet-500/10 transition-colors">
                          Assinar {plan.name}
                        </div>
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>
      )}

      {/* FAQ */}
      {/* FAQ */}
      <motion.section 
        initial={{ opacity: 0, y: 80 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 py-32 border-t border-border bg-background"
      >
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-black tracking-tight sm:text-5xl text-foreground mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-muted-foreground font-medium">
              Tudo o que você precisa saber para começar a usar a ConectaParts.
            </p>
          </div>
          
          <div className="space-y-4 mb-16">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-violet-500/30 transition-colors shadow-sm">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-6 flex items-center justify-between font-black text-xl text-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  {faq.q}
                  <ChevronDown className={`h-6 w-6 text-muted-foreground transition-transform duration-300 ${openFaq === idx ? "rotate-180 text-violet-600 dark:text-violet-400" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-muted-foreground text-lg font-medium leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* SESSÃO SOU LOJISTA E QUERO PARCERIA */}
          <div className="mt-12 p-8 sm:p-12 relative overflow-hidden rounded-3xl group bg-card border border-border shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-100 pointer-events-none" />
            
            <div className="relative flex flex-col items-center text-center z-10">
              <Store className="h-16 w-16 text-violet-600 dark:text-violet-400 mb-6 transition-transform group-hover:scale-110 duration-500" />
              <h3 className="text-3xl sm:text-4xl font-black text-foreground mb-4">Tem uma Loja de Autopeças?</h3>
              <p className="text-muted-foreground text-lg sm:text-xl font-medium max-w-2xl mx-auto mb-8">
                As perguntas acima são para os clientes que vão comprar de você. Se você quer ser a loja que eles encontram, faça nossa parceria agora.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                <Link href="/cadastro/empresa" className="w-full sm:w-auto">
                  <Button className="h-14 px-8 text-lg rounded-xl bg-violet-600 text-white hover:bg-violet-500 font-black shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 w-full">
                    Sou lojista e quero uma parceria
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="outline" className="h-14 px-8 text-lg rounded-xl border-border bg-background text-foreground hover:bg-muted font-bold transition-all shadow-sm w-full">
                    Já sou parceiro
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA FOOTER */}
      <motion.section 
        initial={{ opacity: 0, y: 80 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 py-32 border-t border-border-subtle bg-gradient-to-b from-background to-muted"
      >
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8"
        >
          <div className="glass-panel border border-violet-500/30 rounded-3xl p-12 bg-panel/60 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/10 via-transparent to-indigo-600/10 opacity-50" />
            <div className="relative z-10">
              <h2 className="font-display text-4xl font-black tracking-tight sm:text-5xl text-foreground mb-6 drop-shadow-lg">
                Você tem uma Loja de Autopeças?
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-foreground/80 font-medium mb-10">
                A Agury é a plataforma definitiva construída para digitalizar o seu balcão e conectar você aos clientes certos, sem cobrança de comissões.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link href="/cadastro/empresa">
                  <Button className="h-16 w-full sm:w-auto px-10 text-lg rounded-xl bg-violet-600 text-zinc-50 hover:bg-violet-500 font-black shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] transition-all transform hover:-translate-y-1">
                    Conhecer Benefícios para Lojas <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Mega Footer Infos */}
        <div className="max-w-7xl mx-auto px-4 mt-32 border-t border-border-subtle pt-12 flex flex-col md:flex-row justify-between items-center text-muted-foreground font-medium">
          <div className="flex items-center gap-2 mb-4 md:mb-0 overflow-hidden">
            <img src="/images/logo-conectaparts-transparent.png" alt="ConectaParts" className="h-12 w-auto scale-125 rounded-[2rem] object-contain" />
          </div>
          <div className="flex gap-8 text-sm">
            <Link href="#" className="hover:text-foreground transition-colors">Termos de Uso</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacidade</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contato</Link>
          </div>
          <div className="mt-4 md:mt-0 text-sm">
            © 2026 ConectaParts. Todos os direitos reservados.
          </div>
        </div>
      </motion.section>

    </div>
  );
}
