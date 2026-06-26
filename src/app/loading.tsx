"use client";

import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 animate-ping rounded-full bg-violet-500/20"></div>
          <Loader2 className="h-12 w-12 animate-spin text-violet-500 relative z-10" />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-black text-foreground tracking-wide font-display">Carregando ConectaParts...</h2>
          <p className="text-sm text-muted-foreground mt-2 animate-pulse">Preparando seu ambiente seguro</p>
        </div>
        
        {/* Esqueletos ilustrativos para dar impressao de carregamento de UI */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 w-[80vw] max-w-4xl mx-auto opacity-50">
          <div className="h-32 rounded-2xl bg-zinc-800/50 animate-pulse border border-border-subtle" />
          <div className="h-32 rounded-2xl bg-zinc-800/50 animate-pulse border border-border-subtle hidden sm:block" />
          <div className="h-32 rounded-2xl bg-zinc-800/50 animate-pulse border border-border-subtle hidden sm:block" />
        </div>
      </div>
    </div>
  );
}
