import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

export default async function AdminAuditoriaPage() {
  const session = await getSession();
  if (!session || session.role !== "PLATFORM_ADMIN") redirect("/");

  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Logs de Auditoria</h1>
          <p className="text-zinc-400">Rastreamento de todas as ações sensíveis no sistema</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data / Hora</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead>Entidade</TableHead>
            <TableHead>IP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-xs text-zinc-400 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString("pt-BR")}
              </TableCell>
              <TableCell>
                {log.user ? (
                  <div>
                    {log.user.name}
                    <div className="text-xs text-zinc-500">{log.user.email}</div>
                  </div>
                ) : (
                  <span className="text-zinc-500 italic">Sistema / Anônimo</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="info" className="text-xs font-mono">
                  {log.action}
                </Badge>
              </TableCell>
              <TableCell>
                {log.entity ? (
                  <span className="text-xs font-mono text-zinc-300">
                    {log.entity} <span className="text-zinc-600">({log.entityId})</span>
                  </span>
                ) : (
                  <span className="text-zinc-600">-</span>
                )}
              </TableCell>
              <TableCell className="text-xs font-mono text-zinc-500">
                {log.ipAddress || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
