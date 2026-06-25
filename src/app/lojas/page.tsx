import Link from "next/link";
import { Star, MapPin, Store, Search, SlidersHorizontal, ArrowRight, Navigation, Package } from "lucide-react";
import prisma from "@/lib/db/prisma";
import { Button } from "@/components/ui/Button";
import { LocationFilter } from "@/components/store/LocationFilter";
import { RegionFilter } from "@/components/store/RegionFilter";

export const dynamic = 'force-dynamic';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default async function LojasPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const stateFilter = typeof searchParams.state === 'string' ? searchParams.state : undefined;
  const cityFilter = typeof searchParams.city === 'string' ? searchParams.city : undefined;
  const ratingFilter = typeof searchParams.minRating === 'string' ? parseFloat(searchParams.minRating) : undefined;
  const latFilter = typeof searchParams.lat === 'string' ? parseFloat(searchParams.lat) : undefined;
  const lonFilter = typeof searchParams.lon === 'string' ? parseFloat(searchParams.lon) : undefined;
  const searchTerm = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  
  const whereClause: any = { active: true };
  if (stateFilter && !latFilter) whereClause.state = stateFilter;
  if (cityFilter && !latFilter) whereClause.city = cityFilter;
  if (ratingFilter) whereClause.averageRating = { gte: ratingFilter };
  if (searchTerm) {
    whereClause.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { city: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  let stores = await prisma.store.findMany({
    where: whereClause,
    orderBy: [{ averageRating: 'desc' }, { totalReviews: 'desc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      averageRating: true,
      totalReviews: true,
      city: true,
      state: true,
      logoUrl: true,
      bannerUrl: true,
      description: true,
      latitude: true,
      longitude: true,
      _count: { select: { products: { where: { active: true, deletedAt: null } } } },
      reviews: {
        where: { rating: { gte: 4 }, active: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { comment: true, rating: true, user: { select: { name: true } } }
      }
    }
  });

  if (latFilter && lonFilter) {
    const MAX_DISTANCE_KM = 50;
    const storesWithDistance = stores
      .map(store => {
        if (!store.latitude || !store.longitude) return { ...store, distance: Infinity };
        const distance = getDistance(latFilter, lonFilter, store.latitude, store.longitude);
        return { ...store, distance };
      })
      .filter(store => store.distance <= MAX_DISTANCE_KM);
    storesWithDistance.sort((a, b) => a.distance - b.distance);
    // @ts-ignore
    stores = storesWithDistance;
  }

  const hasFilters = !!(stateFilter || cityFilter || ratingFilter || latFilter || searchTerm);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <div className="fixed inset-0 z-0 bg-mesh-dark pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-grid-dark opacity-20 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/" className="font-display font-extrabold text-2xl tracking-tight text-white flex items-center gap-2">
            <Store className="h-6 w-6 text-violet-500" />
            Agury <span className="text-violet-500">Auto</span>
          </Link>

          {/* Barra de Busca Rápida */}
          <form action="/lojas" method="GET" className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={searchTerm}
              placeholder="Buscar por loja, cidade..."
              className="w-full pl-11 pr-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
            />
          </form>

          <Link href="/cadastro/empresa">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-black font-bold whitespace-nowrap">
              + Cadastrar minha loja
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex max-w-[1600px] mx-auto w-full p-4 sm:p-8 gap-8">
        
        {/* Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-28 glass-panel p-6 rounded-3xl border-white/10 bg-zinc-900/60 space-y-8">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <SlidersHorizontal className="h-5 w-5 text-violet-400" /> Filtrar Lojas
            </div>

            <LocationFilter />
            <RegionFilter />
            
            <div>
              <h4 className="font-bold text-zinc-300 mb-4">Avaliação Mínima</h4>
              <ul className="space-y-3">
                {[5, 4, 3].map(stars => (
                  <li key={stars}>
                    <Link
                      href={`/lojas?minRating=${stars}${stateFilter ? `&state=${stateFilter}` : ''}${searchTerm ? `&q=${searchTerm}` : ''}`}
                      className={`flex items-center gap-2 transition-colors ${ratingFilter === stars ? 'text-amber-400' : 'text-zinc-400 hover:text-amber-400'}`}
                    >
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < stars ? "fill-amber-400 text-amber-400" : "fill-zinc-700 text-zinc-700"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium">& Acima</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {hasFilters && (
              <Link href="/lojas">
                <Button className="w-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white">
                  Limpar Filtros
                </Button>
              </Link>
            )}
          </div>
        </aside>

        {/* Grade de Lojas */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="font-display text-4xl font-extrabold text-white">
                {searchTerm ? `Resultados para "${searchTerm}"` : 'Lojas de Autopeças'}
              </h1>
              <p className="text-zinc-400 mt-1">
                {stores.length > 0 
                  ? `${stores.length} ${stores.length === 1 ? 'loja encontrada' : 'lojas encontradas'}`
                  : 'Nenhuma loja encontrada com estes filtros'}
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {stores.length === 0 ? (
              <div className="glass-panel p-16 rounded-3xl text-center border-white/10 flex flex-col items-center">
                <Search className="h-14 w-14 text-zinc-600 mb-5" />
                <h3 className="text-2xl font-black text-white mb-3">Nenhuma loja encontrada</h3>
                <p className="text-zinc-400 mb-6 max-w-sm">Tente remover alguns filtros ou busque por outra cidade.</p>
                <Link href="/lojas">
                  <Button className="bg-violet-600 hover:bg-violet-500 text-white font-bold">Ver todas as lojas</Button>
                </Link>
              </div>
            ) : (
              stores.map((store) => (
                <div
                  key={store.id}
                  className="glass-panel rounded-[2rem] border border-white/5 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-violet-500/20 transition-all duration-300 overflow-hidden group hover:shadow-[0_0_40px_rgba(139,92,246,0.1)]"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Banner / Logo Area */}
                    <div className="sm:w-56 sm:h-auto h-40 bg-zinc-800 relative overflow-hidden shrink-0">
                      {store.bannerUrl ? (
                        <img src={store.bannerUrl} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Store className="h-16 w-16 text-zinc-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/60" />
                      {/* Logo Badge */}
                      <div className="absolute bottom-3 left-3 sm:hidden">
                        {store.logoUrl ? (
                          <img src={store.logoUrl} alt={store.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-zinc-900 shadow-xl" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-zinc-950 border-2 border-zinc-900 flex items-center justify-center">
                            <Store className="h-6 w-6 text-violet-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 sm:p-8 flex flex-col">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {/* Desktop Logo */}
                          <div className="hidden sm:block shrink-0">
                            {store.logoUrl ? (
                              <img src={store.logoUrl} alt={store.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-zinc-800 shadow-lg" />
                            ) : (
                              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center">
                                <Store className="h-7 w-7 text-violet-500" />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link href={`/loja/${store.slug}`}>
                              <h2 className="text-2xl font-black text-white hover:text-violet-400 transition-colors">{store.name}</h2>
                            </Link>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="flex items-center text-zinc-400 text-sm">
                                <MapPin className="h-3.5 w-3.5 mr-1 text-zinc-500" />
                                {store.city}, {store.state}
                              </span>
                              {/* @ts-ignore */}
                              {store.distance !== undefined && store.distance !== Infinity && (
                                <span className="text-emerald-400 flex items-center bg-emerald-400/10 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                                  <Navigation className="h-3 w-3 mr-1" />
                                  {/* @ts-ignore */}
                                  {store.distance.toFixed(1)} km
                                </span>
                              )}
                              {store._count.products > 0 && (
                                <span className="text-violet-400 flex items-center bg-violet-400/10 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                                  <Package className="h-3 w-3 mr-1" />
                                  {store._count.products} peças
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex flex-col items-start sm:items-end bg-zinc-950/50 p-3 rounded-2xl border border-white/5 shrink-0">
                          <div className="flex text-amber-400 mb-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < Math.round(store.averageRating) ? "fill-amber-400" : "fill-zinc-700 text-zinc-700"}`} />
                            ))}
                          </div>
                          <span className="font-black text-white text-lg leading-none">{store.averageRating.toFixed(1)}</span>
                          <span className="text-zinc-500 text-xs">{store.totalReviews} avaliações</span>
                        </div>
                      </div>

                      {store.description && (
                        <p className="text-zinc-400 text-sm mb-4 line-clamp-2 max-w-2xl">{store.description}</p>
                      )}

                      {/* Último comentário */}
                      {store.reviews.length > 0 && store.reviews[0].comment && (
                        <div className="bg-zinc-950/40 rounded-2xl p-4 border border-white/5 mb-5 flex items-start gap-3">
                          <div className="flex shrink-0 mt-0.5">
                            {Array.from({ length: store.reviews[0].rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <div className="min-w-0">
                            <p className="text-zinc-300 text-sm italic line-clamp-1">"{store.reviews[0].comment}"</p>
                            <p className="text-zinc-600 text-xs mt-1">— {store.reviews[0].user.name}</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-auto flex flex-wrap gap-3 justify-end">
                        <Link href={`/loja/${store.slug}#avaliacoes`}>
                          <Button variant="outline" className="border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 font-bold rounded-xl h-11 px-5 text-sm">
                            Avaliações
                          </Button>
                        </Link>
                        <Link href={`/loja/${store.slug}`}>
                          <Button className="bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl h-11 px-5 text-sm shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                            Ver Peças <ArrowRight className="ml-1.5 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
