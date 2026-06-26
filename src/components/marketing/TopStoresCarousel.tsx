"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { Store, Star, ArrowLeft, ArrowRight, MousePointer2, Hand } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export function TopStoresCarousel({ topStores }: { topStores: TopStore[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center", // Center the active card
    containScroll: false, // REQUIRED to center the first and last slides
    slidesToScroll: 1, // Only one at a time
    dragFree: true,    // Free scrolling (much smoother on mobile)
    skipSnaps: false,  // Snaps smoothly when momentum stops
    duration: 40       // Slower, smoother glide
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);

  // Auto hide hint after 3 seconds AND restrict to 2 views max via localStorage
  useEffect(() => {
    try {
      const views = parseInt(localStorage.getItem('agury_hint_views') || '0', 10);
      if (views < 2) {
        setShowHint(true);
        localStorage.setItem('agury_hint_views', (views + 1).toString());
        const timer = setTimeout(() => setShowHint(false), 3000);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Ignore localStorage errors (e.g., incognito mode restrictions)
    }
  }, []);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  return (
    <div className="relative w-full">
      <div className="overflow-hidden w-full" ref={emblaRef}>
        <div className="flex backface-hidden touch-pan-y py-6 md:py-8 will-change-transform transform-gpu">
          {topStores.map((store, index) => (
            <div
              key={store.id}
              className="flex-none w-[92%] max-w-[370px] sm:max-w-none sm:w-[420px] md:w-[460px] lg:w-[480px] mx-3 sm:mx-4 min-w-0"
            >
              <div className="h-full">
                <Link href={`/loja/${store.slug}`} className="block group h-full">
                  <div className="rounded-[2.5rem] h-full flex flex-col transition-all duration-300 border border-border-subtle bg-zinc-50 dark:bg-zinc-800/80 group-hover:border-amber-500/40 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-700/80 group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)] relative overflow-hidden transform-gpu will-change-transform">
                    {/* BANNER (FOTO SUPERIOR) */}
                    <div className="w-full h-56 sm:h-60 md:h-52 lg:h-48 bg-zinc-200 dark:bg-zinc-800 relative overflow-hidden flex-shrink-0">
                      {/* Fundo fallback elegante se não tiver imagem */}
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900" />
                      
                      {index === 0 && (
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-amber-500 text-black text-[10px] sm:text-xs font-black px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                          #1 NO RANKING
                        </div>
                      )}
                    </div>

                    <div className="p-5 sm:p-6 md:p-5 flex-1 flex flex-col relative z-20 mt-3 md:mt-3 lg:mt-2">
                      {/* Titulo */}
                      <div className="mb-5 md:mb-5 lg:mb-4">
                        <h3 className="font-black text-xl sm:text-2xl md:text-3xl text-foreground group-hover:text-amber-400 transition-colors line-clamp-1">{store.name}</h3>
                        <div className="flex items-center text-muted-foreground text-sm sm:text-base mt-1 md:mt-1 font-medium">
                          <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 text-muted-foreground" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> {store.city}, {store.state}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-5 md:mb-4 lg:mb-2 bg-background/50 p-4 md:p-3 lg:p-2 rounded-2xl md:rounded-xl border border-border-subtle flex-shrink-0">
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${i < Math.round(store.averageRating) ? "fill-amber-400" : "fill-zinc-800 text-zinc-800"}`} />
                          ))}
                        </div>
                        <span className="font-black text-foreground text-xl sm:text-2xl ml-1.5 sm:ml-2">{store.averageRating.toFixed(1)}</span>
                        <span className="text-muted-foreground text-sm sm:text-base font-medium">({store.totalReviews})</span>
                      </div>

                      {(() => {
                        const bestReview = store.reviews.find(r => r.comment && r.rating >= 4);
                        if (!bestReview) return null;
                        return (
                          <div className="mt-4 md:mt-2 lg:mt-1 flex-1">
                            <p className="font-bold text-foreground mb-2 md:mb-1 text-base sm:text-lg">O que estão dizendo:</p>
                            <p className="text-foreground/80 text-sm sm:text-base italic leading-relaxed line-clamp-4 md:line-clamp-3 lg:line-clamp-2">"{bestReview.comment}"</p>
                            <div className="text-muted-foreground text-xs sm:text-sm mt-3 md:mt-3 lg:mt-2 font-bold uppercase tracking-wider">— {bestReview.user.name}</div>
                          </div>
                        );
                      })()}

                      <div className="mt-auto w-full pt-4 md:pt-5 lg:pt-6 flex justify-center pb-3 md:pb-4">
                        <div className="w-[90%] sm:w-[85%] min-h-[3.25rem] md:min-h-[3.5rem] py-2 px-5 flex items-center justify-center bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900 font-black text-base sm:text-lg md:text-xl rounded-2xl border border-zinc-700 dark:border-blue-500 shadow-sm group-hover:bg-amber-500 group-hover:text-black group-hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-colors duration-300 btn-shimmer btn-shimmer-amber text-center">
                          <span className="relative z-20 flex items-center justify-center flex-wrap gap-1.5 tracking-wide">Comentários e Avaliações <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-1 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles: Setas + Paginação (Abaixo do Carrossel) */}
      <div className="flex items-center justify-center mt-2 sm:mt-4 gap-6 sm:gap-8 relative pb-4 -translate-y-2 sm:-translate-y-4">
        {/* Aviso de Tutorial / Swipe Flutuante e Elegante */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: -45, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-50 w-max transform-gpu will-change-transform"
            >
               <div className="bg-zinc-900/90 dark:bg-zinc-100/90 border border-zinc-700/50 dark:border-zinc-300/50 text-zinc-100 dark:text-zinc-900 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-2xl flex items-center gap-2 sm:gap-3 backdrop-blur-md">
                 {/* Ícone Hand (Touch) com leve animação lateral */}
                 <div className="hidden [@media(pointer:coarse)]:block">
                   <motion.div animate={{ x: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                     <Hand className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                   </motion.div>
                 </div>
                 {/* Ícone Mouse (PC) com leve animação lateral */}
                 <div className="hidden [@media(pointer:fine)]:block">
                   <motion.div animate={{ x: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                     <MousePointer2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                   </motion.div>
                 </div>
                 <span className="text-[11px] sm:text-xs md:text-sm font-black tracking-widest uppercase">
                    <span className="hidden [@media(pointer:coarse)]:inline">Deslize ou use as setas abaixo</span>
                    <span className="hidden [@media(pointer:fine)]:inline">Arraste ou use as setas abaixo</span>
                 </span>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow de fundo OTIMIZADO (sem blur CSS) para chamar atenção pras setas */}
        <div className="absolute inset-[-20px] pointer-events-none rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.08)_0%,_transparent_70%)]" />
        
        <button
          onClick={scrollPrev}
          disabled={prevBtnDisabled}
          className={`w-14 h-14 sm:w-16 sm:h-16 md:w-16 md:h-16 rounded-full bg-white dark:bg-zinc-800 border border-border-subtle shadow-lg flex items-center justify-center text-violet-700 dark:text-zinc-300 hover:text-violet-800 dark:hover:text-zinc-100 hover:bg-violet-100 dark:hover:bg-zinc-700 hover:border-violet-300 dark:hover:border-zinc-500 transition-all duration-300 transform-gpu will-change-transform shrink-0
            ${prevBtnDisabled ? "opacity-30 pointer-events-none scale-90" : "opacity-100 scale-100 hover:scale-110 hover:-translate-x-1"}`}
        >
          <ArrowLeft className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
        </button>

        {/* Paginação (Pontinhos) */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2.5 sm:h-3 rounded-full transition-all duration-300 transform-gpu ${
                index === selectedIndex
                  ? "bg-violet-600 dark:bg-zinc-300 w-8 sm:w-10 shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                  : "bg-zinc-300 dark:bg-zinc-700 hover:bg-violet-400 dark:hover:bg-zinc-500 w-2.5 sm:w-3"
              }`}
            />
          ))}
        </div>

        <button
          onClick={scrollNext}
          disabled={nextBtnDisabled}
          className={`w-14 h-14 sm:w-16 sm:h-16 md:w-16 md:h-16 rounded-full bg-white dark:bg-zinc-800 border border-border-subtle shadow-lg flex items-center justify-center text-violet-700 dark:text-zinc-300 hover:text-violet-800 dark:hover:text-zinc-100 hover:bg-violet-100 dark:hover:bg-zinc-700 hover:border-violet-300 dark:hover:border-zinc-500 transition-all duration-300 transform-gpu will-change-transform shrink-0
            ${nextBtnDisabled ? "opacity-30 pointer-events-none scale-90" : "opacity-100 scale-100 hover:scale-110 hover:translate-x-1"}`}
        >
          <ArrowRight className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
        </button>
      </div>
    </div>
  );
}
