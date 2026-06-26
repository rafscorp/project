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
    { q: "Eu pago algo para usar a plataforma?", a: "Não. A plataforma é 100% gratuita para clientes que buscam peças e orçamentos." },
    { q: "Como recebo minhas peças?", a: "Você negocia diretamente com a loja. Pode combinar a retirada no balcão ou entrega, dependendo da disponibilidade do lojista." },
    { q: "Meus dados estão seguros?", a: "Totalmente. Nosso chat protege sua privacidade e você decide quando passar informações adicionais ao lojista." },
    { q: "Posso fazer orçamentos com várias lojas?", a: "Sim! Você pode enviar solicitações e receber propostas de diferentes lojas da sua região para comparar o melhor preço." }
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
          className="mt-16 grid w-full max-w-5xl gap-6 sm:grid-cols-2"
        >
          {/* Card Cliente */}
          <motion.div variants={fadeUp} className="h-full">
            <Link href="/login" className="block h-full group outline-none">
              <div className="glass-panel glass-panel-hover relative flex h-full flex-col sm:flex-row items-center sm:items-start text-center sm:text-left rounded-[2rem] p-6 sm:p-10 transition-all border border-border-subtle bg-panel/60 hover:bg-panel/90 shadow-[0_0_40px_rgba(59,130,246,0.15)] group-hover:shadow-[0_0_60px_rgba(59,130,246,0.3)] group-hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] pointer-events-none" />
                
                <div className="mb-6 sm:mb-0 sm:mr-8 shrink-0 rounded-[1.5rem] bg-background p-6 shadow-inner ring-1 ring-blue-500/40 group-hover:ring-blue-400 group-hover:bg-blue-500/10 transition-all">
                  <CarFront className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 group-hover:text-blue-300" />
                </div>
                
                <div className="flex-1 flex flex-col items-center sm:items-start">
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-foreground mb-3">Sou Cliente</h2>
                  <p className="text-muted-foreground text-base sm:text-lg mb-8 font-medium leading-relaxed">
                    Ache a peça exata, conecte-se com o lojista e negocie com segurança.
                  </p>
                  <div className="mt-auto inline-flex items-center text-blue-400 font-black text-lg group-hover:text-white transition-colors bg-blue-500/10 px-6 py-3 rounded-xl border border-blue-500/20 group-hover:bg-blue-500/30 btn-shimmer btn-shimmer-blue">
                  Entrar na Plataforma <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-2 relative z-20" />
                </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Card Lojista */}
          <motion.div variants={fadeUp} className="h-full">
            <div className="block h-full group outline-none">
              <div className="glass-panel glass-panel-hover relative flex h-full flex-col sm:flex-row items-center sm:items-start text-center sm:text-left rounded-[2rem] p-6 sm:p-10 transition-all border border-border-subtle bg-panel/60 hover:bg-panel/90 shadow-[0_0_40px_rgba(139,92,246,0.15)] group-hover:shadow-[0_0_60px_rgba(139,92,246,0.3)] group-hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-bl from-violet-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] pointer-events-none" />
                
                <div className="mb-6 sm:mb-0 sm:mr-8 shrink-0 rounded-[1.5rem] bg-background p-6 shadow-inner ring-1 ring-violet-500/40 group-hover:ring-violet-400 group-hover:bg-violet-500/10 transition-all">
                  <Store className="h-10 w-10 sm:h-12 sm:w-12 text-violet-400 group-hover:text-violet-300" />
                </div>
                
                <div className="flex-1 flex flex-col items-center sm:items-start">
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-foreground mb-3">Sou Lojista</h2>
                  <p className="text-muted-foreground text-base sm:text-lg mb-8 font-medium leading-relaxed">
                    Digitalize sua loja de autopeças. Conecte-se com clientes 24h por dia de forma segura e organizada.
                  </p>
                  <div className="mt-auto flex flex-col sm:flex-row gap-3 w-full relative z-10">
                    <Link 
                      href="/planos"
                      className="inline-flex items-center justify-center text-violet-400 font-black text-sm sm:text-base group-hover:text-white transition-colors bg-violet-500/10 px-4 py-3 rounded-xl border border-violet-500/20 group-hover:bg-violet-500/40 w-full sm:w-auto btn-shimmer"
                    >
                      Conhecer Planos <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link href="/login" className="inline-flex items-center justify-center text-zinc-500 dark:text-zinc-400 font-bold text-sm sm:text-base group-hover:text-foreground transition-colors bg-zinc-100 dark:bg-zinc-800/50 px-4 py-3 rounded-xl border border-border-subtle group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800 w-full sm:w-auto">
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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="glass-panel p-10 rounded-[2.5rem] border border-border-subtle bg-panel/60 relative h-full flex flex-col group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-8">
                  <Search className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4">Busca Inteligente por Placa</h3>
                <p className="text-muted-foreground leading-relaxed font-medium flex-1">
                  Sem achismos. Não sabe o modelo exato da peça? Digite a placa do seu carro e nós direcionamos a busca com a ficha técnica completa do Detran para evitar compras erradas.
                </p>
              </div>
            </motion.div>

            {/* Feature 2: Chat FOMO */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="glass-panel p-10 rounded-[2.5rem] border border-border-subtle bg-panel/60 relative h-full flex flex-col group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
                  <MessageCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4">Comunicação Segura</h3>
                <p className="text-muted-foreground leading-relaxed font-medium flex-1">
                  Negocie direto pelo nosso chat focado em privacidade. Fale com os lojistas, receba orçamentos detalhados e feche negócio de forma rápida e organizada.
                </p>
              </div>
            </motion.div>

            {/* Feature 3: Faturamento */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="glass-panel p-10 rounded-[2.5rem] border border-border-subtle bg-panel/60 relative h-full flex flex-col group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-8">
                  <ShieldCheck className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4">Conexões Confiáveis</h3>
                <p className="text-muted-foreground leading-relaxed font-medium flex-1">
                  Nós criamos a ponte entre você e as melhores lojas. Compre com segurança, tire suas dúvidas em tempo real e construa um relacionamento de confiança com o comércio local.
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
      <motion.section 
        initial={{ opacity: 0, y: 80 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 py-32 border-t border-border-subtle bg-background/50 backdrop-blur-3xl"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
              Perguntas Frequentes
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-panel border-violet-500/20 bg-panel/60 rounded-2xl overflow-hidden transition-all">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-6 flex items-center justify-between font-bold text-lg text-foreground hover:text-violet-400 transition-colors"
                >
                  {faq.q}
                  <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-foreground/80 font-medium leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
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
