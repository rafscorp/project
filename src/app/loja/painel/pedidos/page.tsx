import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { OrderService } from "@/services/order.service";
import { OrdersManager } from "@/components/dashboard/OrdersManager";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session?.storeId) redirect("/login");

  const orders = await OrderService.listByStore(session.storeId);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Pedidos</h1>
      <p className="mt-1 text-sm text-zinc-400">Gerencie pedidos e códigos de retirada</p>
      <div className="mt-6">
        <OrdersManager initialOrders={JSON.parse(JSON.stringify(orders))} />
      </div>
    </div>
  );
}
