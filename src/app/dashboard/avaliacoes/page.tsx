import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Star, MessageCircle } from "lucide-react";
import { UserRole } from "@prisma/client";

export default async function AvaliacoesPage() {
  const session = await getSession();

  if (!session || !session.storeId || (session.role !== UserRole.STORE_OWNER && session.role !== UserRole.STORE_STAFF)) {
    redirect("/login");
  }

  const store = await prisma.store.findUnique({
    where: { id: session.storeId },
    include: {
      reviews: {
        include: {
          user: { select: { name: true, avatarUrl: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!store) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-white">Avaliações da Loja</h1>
          <p className="text-zinc-400 mt-1">Veja o que seus clientes estão dizendo sobre seus produtos e serviços.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-zinc-900/40 col-span-1 md:col-span-3 lg:col-span-1">
          <h3 className="text-lg font-bold text-white mb-4">Visão Geral</h3>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-5xl font-black text-white">{store.averageRating.toFixed(1)}</span>
            <div className="flex flex-col">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.round(store.averageRating) ? "fill-amber-400" : "fill-zinc-800 text-zinc-800"}`} />
                ))}
              </div>
              <span className="text-zinc-400 text-sm mt-1">{store.totalReviews} avaliações no total</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-zinc-500 text-sm">Apenas clientes autenticados podem avaliar sua loja, garantindo que o feedback seja real e seguro.</p>
          </div>
        </div>

        <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-4">
          {store.reviews.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-white/5 bg-zinc-900/40 text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
              <h3 className="font-display text-xl font-bold text-white mb-2">Nenhuma avaliação ainda</h3>
              <p className="text-zinc-400">Compartilhe o link da sua loja com seus clientes e peça para eles avaliarem os serviços.</p>
            </div>
          ) : (
            store.reviews.map((review) => (
              <div key={review.id} className="glass-panel p-6 rounded-2xl border border-white/5 bg-zinc-900/40 flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0">
                  {review.user.avatarUrl ? (
                    <img src={review.user.avatarUrl} alt={review.user.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold border border-white/10 text-xl">
                      {review.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                    <div>
                      <h4 className="font-bold text-white">{review.user.name}</h4>
                      <p className="text-zinc-500 text-sm">{review.user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-amber-400" : "fill-zinc-800 text-zinc-800"}`} />
                        ))}
                      </div>
                      <span className="text-zinc-500 text-xs">
                        {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(review.createdAt))}
                      </span>
                    </div>
                  </div>
                  {review.comment ? (
                    <p className="text-zinc-300 mt-3 bg-zinc-950/50 p-4 rounded-xl border border-white/5">"{review.comment}"</p>
                  ) : (
                    <p className="text-zinc-500 mt-3 italic text-sm">Avaliação sem comentário escrito.</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
