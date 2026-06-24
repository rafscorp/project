import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { Button } from "@/components/ui/Button";
import { MonitorSmartphone, Shield } from "lucide-react";

export default async function ContaSegurancaPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const activeSessions = await prisma.userSession.findMany({
    where: { userId: session.userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { lastActiveAt: "desc" }
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Segurança</h1>
        <p className="text-zinc-400">Proteja sua conta e gerencie acessos</p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-zinc-800 rounded-xl">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white">Alterar Senha</h3>
            <p className="text-sm text-zinc-400">É recomendável usar uma senha forte e única.</p>
          </div>
        </div>
        
        <form className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Senha Atual</label>
            <input type="password" placeholder="••••••••" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Nova Senha</label>
            <input type="password" placeholder="••••••••" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none" />
          </div>
          <Button type="button">Atualizar Senha</Button>
        </form>
      </div>

      <div>
        <h2 className="font-display text-lg font-bold text-white mb-4 mt-8">Dispositivos Conectados</h2>
        <div className="space-y-3">
          {activeSessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-4">
                <MonitorSmartphone className="w-8 h-8 text-zinc-500" />
                <div>
                  <p className="font-medium text-white">{s.deviceName || "Dispositivo Desconhecido"}</p>
                  <p className="text-xs text-zinc-500">
                    {s.ipAddress} • Último acesso: {new Date(s.lastActiveAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">Desconectar</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
