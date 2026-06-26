import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { EditSubscriptionPriceModal } from "./EditSubscriptionPriceModal";

export default async function AdminAssinaturasPage() {
  const session = await getSession();
  if (!session || session.role !== "PLATFORM_ADMIN") redirect("/");

  const subscriptions = await prisma.subscription.findMany({
    include: {
      store: { select: { name: true } },
      plan: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Assinaturas</h1>
          <p className="text-muted-foreground">Gerencie as assinaturas B2B</p>
        </div>
        <Button>Novo Plano</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Loja</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Valor Mensal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Fim do Período</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell className="font-medium">{sub.store.name}</TableCell>
              <TableCell>{sub.plan.name}</TableCell>
              <TableCell>
                {sub.customPrice ? (
                  <span className="text-green-500 font-bold">{formatCurrency(sub.customPrice)}</span>
                ) : sub.discountPercentage ? (
                  <span className="text-green-500 font-bold">
                    {formatCurrency(sub.plan.priceMonthly * (1 - sub.discountPercentage / 100))}
                    <span className="text-xs ml-1 text-muted-foreground">(-{sub.discountPercentage}%)</span>
                  </span>
                ) : (
                  <span>{formatCurrency(sub.plan.priceMonthly)}</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={sub.status === "ACTIVE" ? "success" : "warning"}>
                  {sub.status}
                </Badge>
              </TableCell>
              <TableCell>
                {sub.currentPeriodEnd 
                  ? new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR")
                  : "N/A"
                }
              </TableCell>
              <TableCell className="text-right">
                <EditSubscriptionPriceModal subscription={sub} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
