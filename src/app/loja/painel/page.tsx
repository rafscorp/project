import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { StoreService } from "@/services/store.service";
import { OrderService } from "@/services/order.service";
import { SubscriptionService } from "@/services/subscription.service";
import { ProductService } from "@/services/product.service";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ORDER_STATUS_LABELS } from "@/types";
import {
  LayoutDashboard, Package, ShoppingBag, CreditCard, Settings, ExternalLink,
} from "lucide-react";

export default async function StoreDashboardPage() {
  const session = await getSession();
  if (!session?.storeId) redirect("/login");

  const [store, orders, products, subscription] = await Promise.all([
    StoreService.getById(session.storeId),
    OrderService.listByStore(session.storeId),
    ProductService.listForDashboard(session.storeId),
    SubscriptionService.getStoreSubscription(session.storeId),
  ]);

  if (!store) redirect("/login");

  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{store.name}</h1>
          <p className="text-sm text-muted-foreground">Painel da loja</p>
        </div>
        <Link href={`/loja/${store.slug}`} target="_blank">
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4" /> Ver loja pública
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Pedidos pendentes", value: pendingOrders, icon: ShoppingBag },
          { label: "Total pedidos", value: orders.length, icon: Package },
          { label: "Produtos", value: products.length, icon: Package },
          { label: "Plano", value: subscription?.plan.name || "—", icon: CreditCard },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardBody className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-display text-xl font-bold text-foreground">{value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Assinatura */}
      {subscription && (
        <Card className="mt-6">
          <CardBody>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Assinatura</p>
                <p className="font-display text-lg font-bold text-foreground">
                  {subscription.plan.name} — {formatCurrency(subscription.plan.priceMonthly)}/mês
                </p>
              </div>
              <Badge variant={subscription.status === "ACTIVE" || subscription.status === "TRIAL" ? "success" : "warning"}>
                {subscription.status}
              </Badge>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Pedidos recentes */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">Pedidos recentes</h2>
          <Link href="/loja/painel/pedidos"><Button variant="ghost" size="sm">Ver todos</Button></Link>
        </div>
        {orders.slice(0, 5).map((order) => (
          <Card key={order.id} className="mb-3">
            <CardBody className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground">{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">{order.customerName} · {formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={order.status === "PENDING" ? "warning" : "success"}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
                <span className="font-bold text-amber-400">{formatCurrency(order.total)}</span>
                <code className="rounded bg-zinc-800 px-2 py-1 text-xs text-muted-foreground">{order.pickupCode}</code>
              </div>
            </CardBody>
          </Card>
        ))}
        {orders.length === 0 && (
          <p className="rounded-2xl border border-border-subtle p-8 text-center text-muted-foreground">Nenhum pedido ainda</p>
        )}
      </div>
    </div>
  );
}
