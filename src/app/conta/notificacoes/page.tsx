import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { Button } from "@/components/ui/Button";
import { Bell, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default async function ContaNotificacoesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Notificações</h1>
          <p className="text-muted-foreground">Suas atualizações e alertas recentes</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <CheckCircle2 className="w-4 h-4" /> Marcar todas como lidas
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-subtle p-12 text-center flex flex-col items-center">
          <div className="p-4 bg-zinc-800/50 rounded-full mb-4">
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium">Nenhuma notificação</p>
          <p className="text-sm text-muted-foreground mt-1">Você está em dia!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div 
              key={n.id} 
              className={cn(
                "p-4 rounded-xl border border-border-subtle flex gap-4 items-start transition-colors",
                n.read ? "bg-panel/30 opacity-70" : "bg-panel/80 shadow-lg border-zinc-700"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg mt-1",
                n.type === "INFO" ? "bg-blue-500/10 text-blue-400" :
                n.type === "SUCCESS" ? "bg-emerald-500/10 text-emerald-400" :
                n.type === "WARNING" ? "bg-amber-500/10 text-amber-400" :
                "bg-red-500/10 text-red-400"
              )}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={cn("font-medium", n.read ? "text-foreground/80" : "text-white")}>
                    {n.title}
                  </h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {new Date(n.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                {!n.read && (
                  <button className="text-xs text-amber-400 hover:text-amber-300 mt-2 font-medium">
                    Marcar como lida
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
