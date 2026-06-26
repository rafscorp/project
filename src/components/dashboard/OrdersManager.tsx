"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ORDER_STATUS_LABELS } from "@/types";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: string;
  total: number;
  pickupCode: string;
  createdAt: string;
  items: { quantity: number; product: { name: string } }[];
};

const STATUS_FLOW = ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "PICKED_UP"];

export function OrdersManager({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(orderId: string, status: string) {
    setLoading(orderId);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    setLoading(null);
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const currentIdx = STATUS_FLOW.indexOf(order.status);
        const nextStatus = STATUS_FLOW[currentIdx + 1];

        return (
          <Card key={order.id}>
            <CardBody>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display font-bold text-foreground">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{order.customerName} · {order.customerPhone}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  <ul className="mt-2 text-sm text-muted-foreground">
                    {order.items.map((item, i) => (
                      <li key={i}>{item.quantity}x {item.product.name}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-400">{formatCurrency(order.total)}</p>
                  <Badge variant={order.status === "PENDING" ? "warning" : order.status === "PICKED_UP" ? "default" : "success"} className="mt-2">
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                  <p className="mt-2 font-mono text-sm text-muted-foreground">Retirada: {order.pickupCode}</p>
                  {nextStatus && order.status !== "CANCELLED" && (
                    <Button
                      size="sm"
                      className="mt-3"
                      loading={loading === order.id}
                      onClick={() => updateStatus(order.id, nextStatus)}
                    >
                      → {ORDER_STATUS_LABELS[nextStatus]}
                    </Button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}
      {orders.length === 0 && (
        <p className="rounded-2xl border border-border-subtle p-12 text-center text-muted-foreground">Nenhum pedido</p>
      )}
    </div>
  );
}
