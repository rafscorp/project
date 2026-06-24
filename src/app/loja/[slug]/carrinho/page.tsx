import { notFound } from "next/navigation";
import { StoreService } from "@/services/store.service";
import { CartPageClient } from "@/components/store/CartPageClient";

export default async function CartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await StoreService.getBySlug(slug);
  if (!store) notFound();

  return <CartPageClient store={{
    slug: store.slug,
    name: store.name,
    city: store.city,
    state: store.state,
    phone: store.phone,
    address: store.address,
  }} />;
}
