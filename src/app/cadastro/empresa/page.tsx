// Force dynamic rendering for pages with database queries
export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardBody } from "@/components/ui/Card";
import { RegisterStoreForm } from "@/components/auth/RegisterStoreForm";
import { SubscriptionService } from "@/services/subscription.service";

export default async function RegisterStorePage() {
  const plans = await SubscriptionService.listPlans();

  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
        <Card>
          <CardBody>
            <h1 className="font-display text-2xl font-bold text-white">Cadastrar minha empresa</h1>
            <p className="mt-1 text-sm text-zinc-400">Crie sua loja online e comece a vender. 14 dias grátis.</p>
            <div className="mt-8">
              <Suspense fallback={<div className="text-zinc-500">Carregando...</div>}>
                <RegisterStoreForm plans={plans.map((p) => ({ slug: p.slug, name: p.name, priceMonthly: p.priceMonthly }))} />
              </Suspense>
            </div>
          </CardBody>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
