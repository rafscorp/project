"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Se já estivermos na home ou landing page, não mostramos
  if (pathname === "/" || pathname === "/login") return null;

  const handleBack = () => {
    // Se o usuário está dentro de áreas de dashboard, evitamos que ele volte pra public (Landing Page) se não tiver histórico
    if (window.history.length <= 2) {
      if (pathname.startsWith("/admin")) return router.push("/admin/dashboard");
      if (pathname.startsWith("/loja/painel")) return router.push("/loja/painel");
      if (pathname.startsWith("/cliente")) return router.push("/cliente/home");
    }
    
    router.back();
  };

  return (
    <button 
      onClick={handleBack}
      className="fixed top-6 left-6 sm:top-8 sm:left-8 flex items-center justify-center w-14 h-14 rounded-full border border-border bg-background hover:bg-muted transition-all shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:scale-105 duration-200 group z-50"
      aria-label="Voltar"
    >
      <ArrowLeft className="h-7 w-7 text-foreground group-hover:text-violet-500 transition-all group-hover:-translate-x-1" />
    </button>
  );
}
