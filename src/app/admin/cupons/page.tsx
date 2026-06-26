import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";

export default async function AdminCuponsPage() {
  const session = await getSession();
  if (!session || session.role !== "PLATFORM_ADMIN") redirect("/");

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { usages: true } }
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Cupons de Desconto</h1>
          <p className="text-muted-foreground">Gerencie cupons para assinaturas ou produtos</p>
        </div>
        <Button>Criar Cupom</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Desconto</TableHead>
            <TableHead>Escopo</TableHead>
            <TableHead>Usos</TableHead>
            <TableHead>Validade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell className="font-medium font-mono text-amber-400">{coupon.code}</TableCell>
              <TableCell>
                <Badge variant="default">{coupon.type === "PERCENTAGE" ? "Porcentagem" : "Fixo"}</Badge>
              </TableCell>
              <TableCell>
                {coupon.type === "PERCENTAGE" 
                  ? `${coupon.value}%` 
                  : formatCurrency(coupon.value)
                }
              </TableCell>
              <TableCell>
                <Badge variant="info">
                  {coupon.scope === "ALL" ? "Geral" : coupon.scope === "SUBSCRIPTION" ? "Assinatura" : "Produto"}
                </Badge>
              </TableCell>
              <TableCell>
                {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : ""}
              </TableCell>
              <TableCell>
                {coupon.expiresAt 
                  ? new Date(coupon.expiresAt).toLocaleDateString("pt-BR")
                  : "Sem validade"
                }
              </TableCell>
              <TableCell>
                <Badge variant={coupon.active ? "success" : "danger"}>
                  {coupon.active ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm">Editar</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
