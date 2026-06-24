import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { Button } from "@/components/ui/Button";

export default async function ContaPerfilPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });

  if (!user) return null;

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Meu Perfil</h1>
        <p className="text-zinc-400">Gerencie suas informações pessoais</p>
      </div>

      <form className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Nome Completo</label>
            <input 
              type="text" 
              defaultValue={user.name}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Username</label>
            <input 
              type="text" 
              defaultValue={user.username}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors" 
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-zinc-300">Email</label>
            <input 
              type="email" 
              defaultValue={user.email}
              disabled
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-zinc-500 cursor-not-allowed" 
            />
            <p className="text-xs text-zinc-500">Para alterar seu email, entre em contato com o suporte.</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-zinc-300">Telefone</label>
            <input 
              type="tel" 
              defaultValue={user.phone || ""}
              placeholder="(00) 00000-0000"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors" 
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-800">
          <Button type="button">Salvar Alterações</Button>
        </div>
      </form>
    </div>
  );
}
