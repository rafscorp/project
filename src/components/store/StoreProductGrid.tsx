"use client";

import { ProductCard } from "@/components/store/ProductCard";
import { useCart } from "@/hooks/useCart";

interface Props {
  storeSlug: string;
  products: {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    price: number;
    comparePrice?: number | null;
    stock: number;
    featured?: boolean;
  }[];
}

export function StoreProductGrid({ storeSlug, products }: Props) {
  const { addItem } = useCart(storeSlug);

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 p-12 text-center text-zinc-500">
        Nenhum produto disponível no momento.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          storeSlug={storeSlug}
          product={product}
          onAdd={() => addItem({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            maxStock: product.stock,
          })}
        />
      ))}
    </div>
  );
}
