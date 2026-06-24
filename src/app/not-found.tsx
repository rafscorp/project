import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
      <h1 className="font-display text-6xl font-bold text-amber-400">404</h1>
      <p className="mt-4 text-zinc-400">Página não encontrada</p>
      <Link href="/" className="mt-8"><Button>Voltar ao início</Button></Link>
    </div>
  );
}
