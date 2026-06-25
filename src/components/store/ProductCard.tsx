"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  storeSlug: string;
  product: {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    price: number;
    comparePrice?: number | null;
    stock: number;
    featured?: boolean;
    condition?: string;
    imageUrl?: string | null;
  };
  onAdd: () => void;
}

export function ProductCard({ storeSlug, product, onAdd }: ProductCardProps) {
  return (
    <article className="group flex flex-col h-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-amber-400/30">
      <div className="mb-4 flex h-40 w-full items-center justify-center rounded-xl bg-zinc-800/50 overflow-hidden relative">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <span className="text-4xl text-zinc-600">🛞</span>
        )}
      </div>
      {product.featured && (
        <span className="mb-2 w-fit rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-400">Destaque</span>
      )}
      {product.condition && product.condition !== 'NEW' && (
        <span className={`mb-2 w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${
          product.condition === 'USED' ? 'bg-zinc-500/15 text-zinc-400' : 'bg-blue-500/15 text-blue-400'
        }`}>
          {product.condition === 'USED' ? 'Usada' : 'Recondicionada'}
        </span>
      )}
      <Link href={`/loja/${storeSlug}/produto/${product.slug}`}>
        <h3 className="font-display font-bold text-white group-hover:text-amber-400">{product.name}</h3>
      </Link>
      {product.description && (
        <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{product.description}</p>
      )}
      <div className="mt-auto pt-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl font-bold text-amber-400">{formatCurrency(product.price)}</span>
          {product.comparePrice && (
            <span className="text-sm text-zinc-500 line-through">{formatCurrency(product.comparePrice)}</span>
          )}
        </div>
        <p className="mt-1 text-xs text-zinc-500">{product.stock} em estoque · Retirada na loja</p>
        <Button
          className="mt-3 w-full"
          size="sm"
          disabled={product.stock <= 0}
          onClick={onAdd}
        >
          <ShoppingCart className="h-4 w-4" /> Agendar
        </Button>
      </div>
    </article>
  );
}
