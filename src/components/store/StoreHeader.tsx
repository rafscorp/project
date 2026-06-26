"use client";

import Link from "next/link";
import { MapPin, Phone, CalendarCheck } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface StoreHeaderProps {
  store: {
    slug: string;
    name: string;
    city: string;
    state: string;
    phone: string;
    address: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
}

export function StoreHeader({ store }: StoreHeaderProps) {
  const { count } = useCart(store.slug);

  return (
    <header className="border-b border-border-subtle bg-panel/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          {store.logoUrl ? <img src={store.logoUrl} alt={store.name} className="h-12 w-12 rounded-full object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/20 text-lg font-bold text-amber-400">{store.name.slice(0, 1)}</div>}
          <div>
            <Link href={`/loja/${store.slug}`} className="font-display text-xl font-bold text-foreground hover:text-amber-400">
              {store.name}
            </Link>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {store.city}/{store.state}</span>
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {store.phone}</span>
            </div>
          </div>
        </div>
        <Link href={`/loja/${store.slug}/carrinho`} className="relative flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-300 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <CalendarCheck className="h-4 w-4" />
          Agenda
          {count > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-zinc-950">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
