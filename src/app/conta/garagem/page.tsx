import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { getUserVehicles } from "@/app/actions/vehicle";
import VirtualGarageClient from "@/components/cliente/VirtualGarageClient";

export const metadata = {
  title: "Minha Garagem | ConectaParts",
  description: "Gerencie os veículos da sua garagem virtual para buscas hiper-personalizadas.",
};

export default async function GaragemPage() {
  const session = await getCurrentSession();
  if (!session || !session.user) {
    redirect("/login");
  }

  // Busca os veículos salvos no BD
  const response = await getUserVehicles(session.user.id);
  const vehicles = response.success && response.vehicles ? response.vehicles : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minha Garagem</h1>
        <p className="text-muted-foreground mt-2">
          Adicione seus veículos pela placa. Quando você buscar peças na plataforma, 
          mostraremos apenas o que serve exatamente no seu carro!
        </p>
      </div>

      <VirtualGarageClient userId={session.user.id} initialVehicles={vehicles} />
    </div>
  );
}
