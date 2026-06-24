import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { SubscriptionService } from "@/services/subscription.service";
import { formatCurrency } from "@/lib/utils/format";
import prisma from "@/lib/db/prisma";
import { Stats } from "@/components/ui/Stats";
import { Store, ShoppingBag, CreditCard, DollarSign } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "PLATFORM_ADMIN") redirect("/");

  const stats = await SubscriptionService.getPlatformStats();
  
  // Get latest 5 stores
  const recentStores = await prisma.store.findMany({
    take: 5,
    include: { subscription: { include: { plan: true } }, owner: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Dashboard Geral</h1>
        <p className="text-zinc-400">Visão geral do desempenho da plataforma</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stats 
          label="Lojas Ativas" 
          value={stats.stores} 
          icon={Store}
          trend={{ value: 12, isPositive: true }}
        />
        <Stats 
          label="Assinaturas" 
          value={stats.activeSubs} 
          icon={CreditCard}
          trend={{ value: 5, isPositive: true }}
        />
        <Stats 
          label="Pedidos (Plataforma)" 
          value={stats.orders} 
          icon={ShoppingBag}
          trend={{ value: 18, isPositive: true }}
        />
        <Stats 
          label="MRR Atual" 
          value={formatCurrency(stats.mrr)} 
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-white">Últimas Lojas Cadastradas</h2>
          <Link href="/admin/lojas">
            <Button variant="ghost" size="sm">Ver todas</Button>
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loja</TableHead>
              <TableHead>Proprietário</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentStores.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">
                  <div>
                    {store.name}
                    <div className="text-xs text-zinc-500">/loja/{store.slug}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {store.owner.name}
                  <div className="text-xs text-zinc-500">{store.owner.email}</div>
                </TableCell>
                <TableCell>
                  {store.subscription?.plan.name || "Nenhum"}
                </TableCell>
                <TableCell>
                  <Badge variant={store.subscription?.status === "ACTIVE" || store.subscription?.status === "TRIAL" ? "success" : "warning"}>
                    {store.subscription?.status || "SEM ASSINATURA"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/lojas/${store.id}`}>
                    <Button variant="outline" size="sm">Detalhes</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
