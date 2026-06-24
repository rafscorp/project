import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Car } from "lucide-react";

export default function EsqueciSenhaPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-amber-400/10 p-2 rounded-xl group-hover:bg-amber-400/20 transition-colors">
              <Car className="h-8 w-8 text-amber-400" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              Agury<span className="text-amber-400">.</span>
            </span>
          </Link>
        </div>
        <h2 className="mt-6 text-center font-display text-3xl font-bold tracking-tight text-white">
          Recuperar senha
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Lembrou a senha?{" "}
          <Link href="/login" className="font-medium text-amber-400 hover:text-amber-300">
            Fazer login
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900/50 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-zinc-800/50 animate-scale-in">
          <form className="space-y-6" action="/api/auth/forgot-password" method="POST">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Endereço de Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-xl border-0 bg-zinc-950/50 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-zinc-800 focus:ring-2 focus:ring-inset focus:ring-amber-400 sm:text-sm sm:leading-6 transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full py-3 text-base">
                Enviar link de recuperação
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
