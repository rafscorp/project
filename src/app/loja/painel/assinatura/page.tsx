import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { SubscriptionService } from "@/services/subscription.service";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SUBSCRIPTION_STATUS_LABELS } from "@/types";
import { CheckoutButton } from "./CheckoutButton";

export default async function SubscriptionPage() {
  const session = await getSession();
  if (!session?.storeId) redirect("/login");

  const sub = await SubscriptionService.getStoreSubscription(session.storeId);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Assinatura</h1>
      <p className="mt-1 text-sm text-muted-foreground">Sua mensalidade para usar a plataforma Agury</p>

      {sub && (
        <Card className="mt-6 max-w-lg">
          <CardBody className="space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="font-display text-xl font-bold text-foreground">{sub.plan.name}</p>
                <p className="text-2xl font-bold text-amber-400">{formatCurrency(sub.plan.priceMonthly)}/mês</p>
              </div>
              <Badge variant={sub.status === "ACTIVE" || sub.status === "TRIAL" ? "success" : "warning"}>
                {SUBSCRIPTION_STATUS_LABELS[sub.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{sub.plan.description}</p>
            {sub.currentPeriodEnd && (
              <p className="text-sm text-muted-foreground">Próximo ciclo: {formatDate(sub.currentPeriodEnd)}</p>
            )}
            
            {sub.status !== "ACTIVE" && (
              <CheckoutButton planId={sub.plan.id} />
            )}
            
            {sub.status === "ACTIVE" && (
              <div className="rounded-xl bg-zinc-800/50 p-4 text-sm text-green-400 border border-green-500/20">
                ✓ Sua assinatura está ativa. Obrigado por usar a Agury!
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
