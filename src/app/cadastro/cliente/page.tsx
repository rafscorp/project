import Link from "next/link";
import { CarFront } from "lucide-react";
import { MultiStepCustomerRegister } from "@/components/auth/MultiStepCustomerRegister";

export const dynamic = 'force-dynamic';

export default function RegisterCustomerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-blue-600/30">
      <div className="fixed inset-0 z-0 bg-mesh-premium pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-grid-premium opacity-20 pointer-events-none" />
      
      {/* Simple Header */}
      <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <CarFront className="h-8 w-8 text-blue-500" />
          <span className="font-display font-bold text-2xl tracking-tight text-foreground">ConectaParts Clientes</span>
        </Link>
        <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
          Já tem conta? <span className="text-blue-400">Entrar</span>
        </Link>
      </header>

      {/* Main Wizard Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center p-4 pt-12">
        <MultiStepCustomerRegister />
      </main>
      
    </div>
  );
}
