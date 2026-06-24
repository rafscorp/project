import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function AdminLojasPage() {
  const session = await getSession();
  if (!session || session.role !== "PLATFORM_ADMIN") redirect("/");

  const stores = await prisma.store.findMany({
    include: {
      owner: { select: { name: true, email: true } },
      subscription: { include: { plan: true } },
      _count: { select: { products: true, orders: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Lojas</h1>
          <p className="text-zinc-400">Gerencie todas as lojas (tenants) da plataforma</p>
        </div>
        <Button>Adicionar Loja</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Loja</TableHead>
            <TableHead>Proprietário</TableHead>
            <TableHead>Produtos</TableHead>
            <TableHead>Pedidos</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stores.map((store) => (
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
              <TableCell>{store._count.products}</TableCell>
              <TableCell>{store._count.orders}</TableCell>
              <TableCell>{store.subscription?.plan.name || "Nenhum"}</TableCell>
              <TableCell>
                <Badge variant={store.active ? "success" : "danger"}>
                  {store.active ? "Ativa" : "Inativa"}
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
  );
}
