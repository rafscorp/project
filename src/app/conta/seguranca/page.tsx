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
        <h1 className="font-display text-2xl font-bold text-foreground">Segurança</h1>
        <p className="text-muted-foreground">Proteja sua conta e gerencie acessos</p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-panel/30 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-zinc-800/80 rounded-xl">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground">Alteração de Senha Segura</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Para sua segurança, a redefinição de senha deve ser feita através do fluxo seguro de recuperação de acesso na tela de login.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-bold text-foreground mb-4 mt-8">Dispositivos Conectados</h2>
        <div className="space-y-3">
          {activeSessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-panel/50">
              <div className="flex items-center gap-4">
                <MonitorSmartphone className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{s.deviceName || "Dispositivo Desconhecido"}</p>
                  <p className="text-xs text-muted-foreground">
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
