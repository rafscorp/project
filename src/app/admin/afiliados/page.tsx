import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";

export default async function AdminAfiliadosPage() {
  const session = await getSession();
  if (!session || session.role !== "PLATFORM_ADMIN") redirect("/");

  const affiliates = await prisma.affiliate.findMany({
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { referrals: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const statusColors: Record<string, "success" | "warning" | "danger" | "default"> = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "danger",
    SUSPENDED: "default",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Afiliados</h1>
          <p className="text-zinc-400">Gerencie parceiros e comissões</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Afiliado</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Indicações</TableHead>
            <TableHead>Ganhos</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {affiliates.map((affiliate) => (
            <TableRow key={affiliate.id}>
              <TableCell className="font-medium">
                {affiliate.user.name}
                <div className="text-xs text-zinc-500">{affiliate.user.email}</div>
              </TableCell>
              <TableCell className="font-mono text-sm">{affiliate.code}</TableCell>
              <TableCell>{affiliate._count.referrals}</TableCell>
              <TableCell className="text-emerald-400 font-medium">
                {formatCurrency(affiliate.totalEarnings)}
              </TableCell>
              <TableCell>
                {formatCurrency(affiliate.totalPaid)}
              </TableCell>
              <TableCell>
                <Badge variant={statusColors[affiliate.status]}>
                  {affiliate.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm">Gerenciar</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
