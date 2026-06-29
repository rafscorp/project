import Link from "next/link";
import { notFound } from "next/navigation";
import { StoreService } from "@/services/store.service";
import { ProductService } from "@/services/product.service";
import { getSession } from "@/lib/auth/session";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreProductGrid } from "@/components/store/StoreProductGrid";
import { CustomPartRequest } from "@/components/store/CustomPartRequest";
import { StoreReviews } from "@/components/store/StoreReviews";
import { Footer } from "@/components/layout/Footer";

interface Props {
  params: Promise<{ slug: string }>;
}

/** Página pública da loja — /loja/[slug] */
export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const store = await StoreService.getBySlug(slug);

  if (!store || !StoreService.isSubscriptionActive(store)) {
    notFound();
  }

  const products = await ProductService.listByStore(store.id);
  const session = await getSession();

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader store={store} />
      {store.bannerUrl && <img src={store.bannerUrl} alt={store.name} className="h-56 w-full object-cover" />}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {store.description && (
          <p className="mb-8 max-w-2xl text-muted-foreground">{store.description}</p>
        )}

        {store.categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {store.categories.map((cat) => (
              <span key={cat.id} className="rounded-lg bg-zinc-800 px-3 py-1 text-sm text-foreground/80">{cat.name}</span>
            ))}
          </div>
        )}

        <StoreProductGrid storeSlug={slug} products={products} />

        {/* Pedido de Peça Sob Encomenda (Motor de Orçamentos) */}
        <CustomPartRequest 
          storeId={store.id} 
          storeName={store.name} 
          isCustomer={!!session && session.role === "CUSTOMER"} 
          storeSlug={store.slug}
        />

        <div className="mt-12 rounded-2xl border border-border-subtle bg-panel/50 p-6">
          <h3 className="font-display font-bold text-foreground">📍 Retirada na loja</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {store.address} — {store.city}/{store.state}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Telefone: {store.phone}</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-border-subtle">
            <iframe
              title={`Mapa de ${store.name}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(`${store.address}, ${store.city} - ${store.state}`)}&z=15&output=embed`}
              className="h-60 w-full"
            />
          </div>
        </div>

        {/* Galeria de Fotos */}
        {store.galleryUrls && (store.galleryUrls as string[]).length > 0 && (
          <div className="mt-12">
            <h3 className="font-display font-bold text-foreground text-2xl mb-6">Nossa Vitrine</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(store.galleryUrls as string[]).map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-border-subtle group">
                  <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Avaliações da Loja */}
        <StoreReviews 
          storeId={store.id}
          storeSlug={store.slug}
          reviews={store.reviews} 
          averageRating={store.averageRating} 
          totalReviews={store.totalReviews} 
          hasSession={!!session}
        />
      </main>
      <Footer />
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const store = await StoreService.getBySlug(slug);
  return { title: store?.name || "Loja" };
}
