import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { UserRole } from "@prisma/client";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session || !session.storeId || (session.role !== UserRole.STORE_OWNER && session.role !== UserRole.STORE_STAFF)) {
    redirect("/login");
  }

  const store = await prisma.store.findUnique({
    where: { id: session.storeId },
    include: { subscription: true }
  });

  if (!store) {
    redirect("/login");
  }

  // Não podemos importar StoreService direto devido a dependências circulares na config as vezes, mas podemos calcular aqui
  const sub = store.subscription;
  const isHardLocked = sub && sub.status === "PAST_DUE" && sub.currentPeriodEnd && 
    Math.floor((new Date().getTime() - sub.currentPeriodEnd.getTime()) / (1000 * 3600 * 24)) >= 5;

  if (isHardLocked) {
    redirect("/dashboard/pagamento");
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-black text-white">Configurações da Oficina</h1>
        <p className="text-zinc-400 mt-1">Personalize sua vitrine, adicione sua logo e atualize seus dados de contato.</p>
      </div>

      <SettingsForm initialStore={{
        name: store.name,
        slug: store.slug,
        phone: store.phone,
        address: store.address,
        description: store.description || "",
        logoUrl: store.logoUrl || "",
        bannerUrl: store.bannerUrl || ""
      }} />
    </div>
  );
}
