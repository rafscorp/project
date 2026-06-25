import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { StoreService } from "@/services/store.service";
import { StoreSettingsForm } from "@/components/app/StoreSettingsForm";

interface StoreSettingsPageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    cnpj?: string | null;
    address: string;
    city: string;
    state: string;
    zipCode?: string | null;
    phone: string;
    email: string;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
}

export default async function SettingsPage({ store }: StoreSettingsPageProps) {
  const session = await getSession();
  if (!session?.storeId) redirect("/login");

  const currentStore = await StoreService.getById(session.storeId);
  if (!currentStore) redirect("/login");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Configurações</h1>
      <p className="mt-1 text-sm text-zinc-400">Dados da sua loja</p>
      <StoreSettingsForm store={{
        id: currentStore.id,
        name: currentStore.name,
        slug: currentStore.slug,
        cnpj: currentStore.cnpj,
        address: currentStore.address,
        city: currentStore.city,
        state: currentStore.state,
        zipCode: currentStore.zipCode,
        phone: currentStore.phone,
        email: currentStore.email,
        description: currentStore.description,
        logoUrl: currentStore.logoUrl,
        bannerUrl: currentStore.bannerUrl,
        latitude: currentStore.latitude,
        longitude: currentStore.longitude,
      }} />
    </div>
  );
}
