"use client";

import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="bg-background text-foreground flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-md text-center p-8 rounded-3xl glass-panel border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold font-display mb-3">Erro Crítico do Sistema</h2>
          <p className="text-muted-foreground mb-8">
            Encontramos um erro inesperado. Nossa equipe técnica (Sentry) já foi notificada para resolver isso o mais rápido possível.
          </p>
          <Button 
            onClick={() => reset()}
            className="w-full h-12 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 font-bold rounded-xl"
          >
            Tentar Novamente
          </Button>
        </div>
      </body>
    </html>
  );
}
