import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShoppingBag } from "lucide-react";

export default async function ContaPedidosPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { customerId: session.userId },
    include: { store: { select: { name: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Meus Pedidos</h1>
        <p className="text-muted-foreground">Histórico de compras e status de retirada</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState 
          icon={ShoppingBag}
          title="Nenhum pedido encontrado"
          description="Você ainda não realizou nenhuma compra nas lojas da plataforma."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Loja</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium font-mono text-xs">{order.orderNumber}</TableCell>
                <TableCell>{order.store.name}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>
                  <Badge variant={order.status === "CONFIRMED" ? "success" : "warning"}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(order.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
