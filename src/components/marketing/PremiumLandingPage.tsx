"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { 
  CarFront, 
  Store, 
  Search, 
  CreditCard,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Star,
  MapPin,
  MessageCircle,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/Button";

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

export default function PremiumLandingPage({ topStores, plans }: PremiumLandingPageProps) {
  let topStoresTitle = "Nossas Melhores Lojas";
  if (topStores.length === 1) {
    topStoresTitle = `A Loja Mais Bem Avaliada de ${topStores[0].state || "Nossa Plataforma"}`;
  } else if (topStores.length > 1) {
    topStoresTitle = `Top ${topStores.length} Lojas e Oficinas Mais Bem Avaliadas`;
  }

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "A plataforma cobra comissão nas vendas de peças?", a: "Não. Diferente de outros marketplaces, nós não cobramos taxa sobre suas vendas. Você assina o plano da plataforma e todo o lucro das suas peças fica com você." },
    { q: "Posso cancelar minha assinatura a qualquer momento?", a: "Sim, nossos planos são mensais e podem ser cancelados a qualquer momento diretamente no painel do lojista, sem multas ou fidelidade." },
    { q: "Como meus clientes pagam?", a: "Oferecemos integração transparente. O cliente entra na sua loja Agury, escolhe a peça, paga via PIX ou Cartão (em até 12x) e o dinheiro vai direto para a sua conta." },
    { q: "Eu já tenho oficina ou autopeças, a Agury serve pra mim?", a: "Sim! A Agury é perfeita para digitalizar seu balcão. Clientes encomendam e compram peças online e retiram diretamente com você, tudo integrado ao seu painel." }
  ];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      
      {/* BACKGROUND GLOBAL */}
      <div className="fixed inset-0 z-0 bg-mesh-dark pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-grid-dark opacity-40 pointer-events-none" />
      
      {/* 1. HERO GIGANTE */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-12 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center w-full max-w-5xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="mb-8 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/50 bg-violet-500/20 px-5 py-2 text-sm font-bold text-violet-200 backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Star className="h-4 w-4 text-amber-400" />
              O Ecossistema Automotivo Definitivo
            </span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="font-display text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl text-white">
            A forma <span className="text-gradient">inteligente</span> de<br className="hidden sm:block" /> se conectar.
          </motion.h1>
          
          <motion.p variants={fadeUp} className="mx-auto mt-8 max-w-2xl text-xl text-zinc-300 leading-relaxed font-medium">
            Seja bem-vindo à Agury. A ponte de altíssima tecnologia que liga quem precisa de soluções automotivas aos melhores lojistas e oficinas do país.
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
              <div className="glass-panel glass-panel-hover glow-card relative flex h-full flex-col sm:flex-row items-center sm:items-start text-center sm:text-left rounded-[2rem] p-8 sm:p-10 transition-all border-blue-500/30 bg-zinc-900/60 hover:bg-zinc-900/90 shadow-[0_0_40px_rgba(59,130,246,0.15)] group-hover:shadow-[0_0_60px_rgba(59,130,246,0.3)] group-hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] pointer-events-none" />
                
                <div className="mb-6 sm:mb-0 sm:mr-8 shrink-0 rounded-[1.5rem] bg-zinc-950 p-6 shadow-inner ring-1 ring-blue-500/40 group-hover:ring-blue-400 group-hover:bg-blue-500/10 transition-all">
                  <CarFront className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 group-hover:text-blue-300" />
                </div>
                
                <div className="flex-1 flex flex-col items-center sm:items-start">
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-white mb-3">Sou Cliente</h2>
                  <p className="text-zinc-400 text-base sm:text-lg mb-8 font-medium leading-relaxed">
                    Ache a peça exata, compre online e retire na oficina de confiança mais próxima.
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
            <Link href="/login" className="block h-full group outline-none">
              <div className="glass-panel glass-panel-hover glow-card relative flex h-full flex-col sm:flex-row items-center sm:items-start text-center sm:text-left rounded-[2rem] p-8 sm:p-10 transition-all border-violet-500/30 bg-zinc-900/60 hover:bg-zinc-900/90 shadow-[0_0_40px_rgba(139,92,246,0.15)] group-hover:shadow-[0_0_60px_rgba(139,92,246,0.3)] group-hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-bl from-violet-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] pointer-events-none" />
                
                <div className="mb-6 sm:mb-0 sm:mr-8 shrink-0 rounded-[1.5rem] bg-zinc-950 p-6 shadow-inner ring-1 ring-violet-500/40 group-hover:ring-violet-400 group-hover:bg-violet-500/10 transition-all">
                  <Store className="h-10 w-10 sm:h-12 sm:w-12 text-violet-400 group-hover:text-violet-300" />
                </div>
                
                <div className="flex-1 flex flex-col items-center sm:items-start">
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-white mb-3">Sou Lojista</h2>
                  <p className="text-zinc-400 text-base sm:text-lg mb-8 font-medium leading-relaxed">
                    Digitalize sua oficina. Venda peças 24h por dia e receba orçamentos via WhatsApp.
                  </p>
                  <div className="mt-auto inline-flex items-center text-violet-400 font-black text-lg group-hover:text-white transition-colors bg-violet-500/10 px-6 py-3 rounded-xl border border-violet-500/20 group-hover:bg-violet-500/30 btn-shimmer">
                  Gerenciar Negócio <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-2 relative z-20" />
                </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
        
      </section>

      {/* TOP LOJAS */}
      {topStores.length > 0 && (
        <section className="relative z-10 py-32 border-t border-white/5 bg-zinc-950/80 backdrop-blur-3xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
              <motion.h2 variants={fadeUp} className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
                {topStoresTitle}
              </motion.h2>
              <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-xl text-zinc-300">
                A qualidade fala por si só. Conheça as oficinas de elite aprovadas por milhares de clientes.
              </motion.p>
            </motion.div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              {topStores.map((store, index) => (
                <motion.div 
                  key={store.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/loja/${store.slug}#avaliacoes`} className="block h-full group outline-none">
                    <div className="glass-panel rounded-[2rem] h-full flex flex-col transition-all duration-300 border-white/5 bg-zinc-900/60 group-hover:border-amber-500/40 group-hover:bg-zinc-900/90 group-hover:shadow-[0_20px_60px_rgba(245,158,11,0.15)] group-hover:-translate-y-2 relative overflow-hidden">
                      
                      {/* BANNER / ESPAÇO DA FOTO GIGANTE */}
                      <div className="w-full h-48 bg-zinc-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 to-transparent z-10" />
                        
                        {/* Imagem Placeholder se não tiver foto do Store */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                          <Store className="h-20 w-20 text-zinc-500" />
                        </div>

                        {index === 0 && (
                          <div className="absolute top-4 right-4 z-20 bg-amber-500 text-black text-xs font-black px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                            #1 NO RANKING
                          </div>
                        )}
                      </div>
                      
                      <div className="p-8 flex-1 flex flex-col relative z-20 -mt-12">
                        {/* Avatar da Loja Subindo pro Banner */}
                        <div className="flex items-end gap-4 mb-6">
                          {store.logoUrl ? (
                            <img src={store.logoUrl} alt={store.name} className="w-20 h-20 rounded-2xl object-cover bg-zinc-950 border-4 border-zinc-900 shadow-xl" />
                          ) : (
                            <div className="w-20 h-20 rounded-2xl bg-zinc-950 flex items-center justify-center text-zinc-400 border-4 border-zinc-900 shadow-xl">
                              <Store className="h-10 w-10 text-amber-500" />
                            </div>
                          )}
                          <div className="pb-1">
                            <h3 className="font-black text-2xl text-white group-hover:text-amber-400 transition-colors drop-shadow-md">{store.name}</h3>
                            <div className="flex items-center text-zinc-400 text-sm mt-1 font-medium">
                              <MapPin className="h-4 w-4 mr-1 text-zinc-500" /> {store.city}, {store.state}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-6 bg-zinc-950/50 p-4 rounded-2xl border border-white/5">
                          <div className="flex text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-5 w-5 ${i < Math.round(store.averageRating) ? "fill-amber-400" : "fill-zinc-800 text-zinc-800"}`} />
                            ))}
                          </div>
                          <span className="font-black text-white text-xl ml-2">{store.averageRating.toFixed(1)}</span>
                          <span className="text-zinc-500 text-sm font-medium">({store.totalReviews})</span>
                        </div>

                        {store.reviews.length > 0 && store.reviews[0].comment && (
                          <div className="mb-8 flex-1">
                            <p className="text-zinc-300 text-base italic leading-relaxed">"{store.reviews[0].comment}"</p>
                            <div className="text-zinc-500 text-sm mt-3 font-bold uppercase tracking-wider">— {store.reviews[0].user.name}</div>
                          </div>
                        )}

                        <div className="mt-auto w-full pt-4">
                          <div className="w-full h-14 flex items-center justify-center bg-zinc-800 text-zinc-300 font-bold text-lg rounded-xl group-hover:bg-amber-500 group-hover:text-black group-hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all btn-shimmer btn-shimmer-amber">
                            <span className="relative z-20 flex items-center">Comentários e Avaliações <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0 }} 
              whileInView={{ opacity: 1 }} 
              viewport={{ once: true }}
              className="mt-20 text-center"
            >
              <Link href="/lojas">
                <Button size="lg" className="h-16 px-10 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-full font-black text-lg shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:shadow-[0_0_60px_rgba(245,158,11,0.6)] border-none group transition-all transform hover:-translate-y-1 btn-shimmer btn-shimmer-amber">
                  <span className="relative z-20 flex items-center">Melhores lojas <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" /></span>
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* DIFERENCIAIS TECNOLÓGICOS (MÁQUINA DE VENDAS B2B) */}
      <section className="relative z-10 py-32 border-t border-white/5 bg-zinc-950 overflow-hidden">
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
            <motion.h2 variants={fadeUp} className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
              A Ferramenta Definitiva para Oficinas
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-xl text-zinc-400 font-medium">
              Esqueça as plataformas genéricas. Nós construímos o sistema perfeito para autopeças, resolvendo as dores reais do seu balcão.
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
              <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5 bg-zinc-900/60 relative h-full flex flex-col group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-8">
                  <Search className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">Busca Inteligente por Placa</h3>
                <p className="text-zinc-400 leading-relaxed font-medium flex-1">
                  Sem achismos. O cliente não sabe o modelo exato? Ele digita a placa no seu site e nós puxamos a ficha técnica completa do Detran (Marca, Modelo, Ano e Cor) direto pro seu painel.
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
              <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5 bg-zinc-900/60 relative h-full flex flex-col group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
                  <MessageCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">Negociação Real-Time</h3>
                <p className="text-zinc-400 leading-relaxed font-medium flex-1">
                  Sua loja tem um chat integrado estilo OLX. Receba o pedido da peça, negocie com o cliente ao vivo, envie ofertas com 1 clique e feche a venda muito mais rápido.
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
              <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5 bg-zinc-900/60 relative h-full flex flex-col group-hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-8">
                  <ShieldCheck className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">Lucro 100% Seu</h3>
                <p className="text-zinc-400 leading-relaxed font-medium flex-1">
                  Não somos marketplace, não mordemos a sua margem. Você assina a plataforma, vende suas peças sem taxas escondidas e o dinheiro cai direto na sua conta do Mercado Pago ou Stripe.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* PLANOS PARA LOJISTAS DINÂMICOS DO BANCO */}
      <section className="relative z-10 py-32 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/50 bg-violet-900/30 px-5 py-2 text-sm font-bold text-violet-200">
              <Store className="h-4 w-4" /> Para Oficinas e Autopeças
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
              Planos desenhados para acelerar.
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-xl text-zinc-300 font-medium">
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
                        <div className="bg-zinc-950 rounded-[22px] p-8 h-full relative overflow-hidden group-hover:bg-zinc-900 transition-colors flex flex-col">
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute top-0 right-8 -translate-y-1/2 z-20">
                            <span className="bg-violet-500 text-white text-xs font-black uppercase tracking-widest py-1.5 px-4 rounded-full shadow-[0_4px_20px_rgba(139,92,246,0.6)] border border-violet-400">
                              Mais Escolhido
                            </span>
                          </div>
                          
                          <div className="relative z-10 flex-1 flex flex-col">
                            <h3 className="text-2xl font-black text-violet-400 group-hover:text-violet-300">{plan.name}</h3>
                            <div className="mt-4 flex items-baseline text-6xl font-extrabold text-white">
                              R$ {plan.priceMonthly}<span className="text-2xl font-medium text-zinc-500">/mês</span>
                            </div>
                            <p className="mt-4 text-zinc-300 font-medium">{plan.description}</p>
                            <ul className="mt-8 space-y-4 mb-8 flex-1">
                              {featuresArray.map((feature: string) => (
                                <li key={feature} className="flex items-center text-white font-medium text-lg">
                                  <CheckCircle2 className="h-6 w-6 text-violet-400 mr-3 shrink-0" /> {feature}
                                </li>
                              ))}
                            </ul>
                            <div className="w-full mt-auto flex items-center justify-center h-16 bg-violet-600 text-white font-black text-xl rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.4)] group-hover:bg-violet-500 group-hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-all btn-shimmer">
                              <span className="relative z-20">Assinar {plan.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // CARD NORMAL
                      <div className="glass-panel p-8 rounded-3xl border-white/10 bg-zinc-900/80 group-hover:bg-zinc-800 transition-colors group-hover:border-zinc-600 h-full flex flex-col">
                        <h3 className="text-2xl font-bold text-zinc-100 group-hover:text-white">{plan.name}</h3>
                        <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                          R$ {plan.priceMonthly}<span className="text-xl font-medium text-zinc-500">/mês</span>
                        </div>
                        <p className="mt-4 text-zinc-300 font-medium">{plan.description}</p>
                        <ul className="mt-8 space-y-4 mb-8 flex-1">
                          {featuresArray.map((feature: string) => (
                            <li key={feature} className="flex items-center text-zinc-200 font-medium">
                              <CheckCircle2 className="h-6 w-6 text-zinc-500 mr-3 shrink-0 group-hover:text-zinc-400" /> {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="w-full mt-auto flex items-center justify-center h-14 bg-zinc-800 text-white group-hover:bg-white group-hover:text-black font-bold text-lg rounded-xl transition-colors">
                          Escolher {plan.name}
                        </div>
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 py-32 border-t border-white/10 bg-zinc-950/50 backdrop-blur-3xl">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
              Perguntas Frequentes
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-panel border-white/10 bg-zinc-900/60 rounded-2xl overflow-hidden transition-all">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-6 flex items-center justify-between font-bold text-lg text-white hover:text-violet-400 transition-colors"
                >
                  {faq.q}
                  <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-zinc-300 font-medium leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="relative z-10 py-32 border-t border-white/10 bg-gradient-to-b from-zinc-950 to-black">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
        >
          <h2 className="font-display text-5xl font-black tracking-tight sm:text-6xl text-white drop-shadow-lg">
            Acelere as vendas da sua loja.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-2xl text-zinc-300 font-medium">
            Junte-se às melhores oficinas e autopeças do país. Plataforma completa, zero comissões.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/login?role=store">
              <Button className="h-16 w-full sm:w-auto px-12 text-xl rounded-2xl bg-white text-black hover:bg-zinc-200 font-black shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all transform hover:-translate-y-1">
                Assinar Plataforma e Começar
              </Button>
            </Link>
          </div>
        </motion.div>
        
        {/* Mega Footer Infos */}
        <div className="max-w-7xl mx-auto px-4 mt-32 border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center text-zinc-500 font-medium">
          <div className="flex items-center gap-2 mb-4 md:mb-0 text-white font-black text-xl">
            <Store className="h-6 w-6 text-violet-500" /> AGURY
          </div>
          <div className="flex gap-8 text-sm">
            <Link href="#" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="#" className="hover:text-white transition-colors">Contato</Link>
          </div>
          <div className="mt-4 md:mt-0 text-sm">
            © 2026 Agury Platform. Todos os direitos reservados.
          </div>
        </div>
      </section>

    </div>
  );
}
