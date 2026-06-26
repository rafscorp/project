import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils/format";
import { Stats } from "@/components/ui/Stats";
import { TrendingUp, CreditCard, DollarSign, ArrowDownRight } from "lucide-react";

export default async function AdminFinanceiroPage() {
  const session = await getSession();
  if (!session || session.role !== "PLATFORM_ADMIN") redirect("/");

  // Basic stats
  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: "PAID" }
  });



  // Since prisma aggregate sum on relations is tricky, let's fetch active subs and calculate MRR
  const activeSubs = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    include: { plan: true }
  });
  const mrrCalculated = activeSubs.reduce((acc, sub) => acc + sub.plan.priceMonthly, 0);

  const payments = await prisma.payment.findMany({
    include: { subscription: { include: { store: true } } },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">Receitas, faturas e fluxo de caixa da plataforma</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stats 
          label="Receita Total (All Time)" 
          value={formatCurrency(totalRevenue._sum.amount || 0)} 
          icon={TrendingUp}
        />
        <Stats 
          label="MRR (Receita Recorrente)" 
          value={formatCurrency(mrrCalculated)} 
          icon={DollarSign}
        />
        <Stats 
          label="Repasses Pendentes (Afiliados)" 
          value={formatCurrency(0)} // Placeholder for affiliate payments
          icon={ArrowDownRight}
        />
      </div>

      <div>
        <h2 className="font-display text-lg font-bold text-foreground mb-4 mt-8">Últimos Pagamentos B2B</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Loja</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{new Date(payment.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>{payment.subscription?.store.name || "N/A"}</TableCell>
                <TableCell>{payment.description || "Assinatura"}</TableCell>
                <TableCell className="capitalize">{payment.gateway}</TableCell>
                <TableCell>
                  <Badge variant={payment.status === "PAID" ? "success" : payment.status === "FAILED" ? "danger" : "warning"}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(payment.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
