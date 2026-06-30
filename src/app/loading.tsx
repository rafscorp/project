import { CarFront } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-violet-600/10 border border-violet-500/20 shadow-[0_0_50px_rgba(139,92,246,0.15)] animate-pulse">
          <CarFront className="w-10 h-10 text-violet-500 animate-bounce" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-0 rounded-full border-t-2 border-violet-500 animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-display font-bold text-foreground tracking-tight">Carregando Plataforma...</h2>
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Conectando aos servidores</p>
        </div>
      </div>
    </div>
  );
}
