import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StoreService } from "@/services/store.service";

export default async function LojasPage() {
  const stores = await StoreService.listPublic(50);

  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-white">Lojas parceiras</h1>
        <p className="mt-2 text-zinc-400">Compre e retire na loja física</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Link key={store.id} href={`/loja/${store.slug}`}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-amber-400/30">
              <h2 className="font-display font-bold text-white">{store.name}</h2>
              <p className="text-sm text-zinc-500">{store.city}/{store.state}</p>
              {store.description && <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{store.description}</p>}
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
