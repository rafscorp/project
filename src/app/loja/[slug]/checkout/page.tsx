import { notFound } from "next/navigation";
import { StoreService } from "@/services/store.service";
import { CheckoutPageClient } from "@/components/store/CheckoutPageClient";

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await StoreService.getBySlug(slug);
  if (!store) notFound();

  return <CheckoutPageClient store={{
    slug: store.slug,
    name: store.name,
    city: store.city,
    state: store.state,
    phone: store.phone,
    address: store.address,
  }} />;
}
