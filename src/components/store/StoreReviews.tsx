"use client";

import { useState } from "react";
import { Star, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    name: string;
    avatarUrl: string | null;
  };
}

interface StoreReviewsProps {
  storeId: string;
  storeSlug: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  hasSession: boolean;
}

export function StoreReviews({ storeId, storeSlug, reviews, averageRating, totalReviews, hasSession }: StoreReviewsProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSession) {
      router.push(`/login?callbackUrl=/loja/${storeSlug}`);
      return;
    }

    if (rating === 0) {
      setError("Por favor, selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/lojas/${storeSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao enviar avaliação");

      // Limpar form e atualizar página
      setRating(0);
      setComment("");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div id="avaliacoes" className="mt-12 space-y-8 scroll-mt-24">
      {/* Lista de Avaliações */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-black text-foreground">Comentários e Avaliações</h2>
            <p className="text-muted-foreground text-sm mt-1">O que os clientes dizem sobre esta loja</p>
          </div>
          
          {totalReviews > 0 && (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="font-black text-foreground text-3xl">{averageRating.toFixed(1)}</span>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-6 w-6 ${i < Math.round(averageRating) ? "fill-amber-400" : "fill-zinc-800 text-zinc-800"}`} />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground text-sm mt-1 font-medium">{totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'}</p>
            </div>
          )}
        </div>

        {totalReviews === 0 ? (
          <div className="rounded-2xl border border-border-subtle bg-panel/50 p-8 text-center mb-8">
            <MessageCircle className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
            <p className="text-muted-foreground">Esta loja ainda não possui avaliações. Seja o primeiro a avaliar após uma compra!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {reviews.map((review) => (
              <div key={review.id} className="glass-panel p-6 rounded-2xl border border-border-subtle bg-panel/40 hover:bg-panel/60 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {review.user.avatarUrl ? (
                      <img src={review.user.avatarUrl} alt={review.user.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-muted-foreground font-bold border border-border-subtle">
                        {review.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{review.user.name}</h4>
                      <p className="text-muted-foreground text-xs">
                        {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(review.createdAt))}
                      </p>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-amber-400" : "fill-zinc-800 text-zinc-800"}`} />
                    ))}
                  </div>
                </div>
                {review.comment ? (
                  <p className="text-foreground/80 text-sm leading-relaxed">"{review.comment}"</p>
                ) : (
                  <p className="text-muted-foreground text-sm italic">Avaliação sem comentário.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulário de Deixar Avaliação */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-violet-500/20 bg-panel/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
        <h3 className="font-display font-bold text-xl text-foreground mb-2 relative z-10">Deixe sua Avaliação</h3>
        <p className="text-muted-foreground text-sm mb-6 relative z-10">Sua opinião ajuda outros motoristas e fortalece a comunidade.</p>
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">Sua nota para esta loja</label>
            <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    className={`h-8 w-8 transition-colors ${
                      (hoverRating || rating) >= star 
                        ? "fill-amber-400 text-amber-400" 
                        : "fill-zinc-800 text-zinc-700"
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-foreground/80 mb-2">Seu comentário (opcional)</label>
            <textarea
              id="comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Como foi o atendimento? A peça estava como descrita?"
              className="w-full bg-background border border-border-subtle rounded-xl p-4 text-foreground placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            {!hasSession ? (
              <Button type="button" onClick={() => router.push(`/login?callbackUrl=/loja/${storeSlug}`)} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold h-12 px-6">
                Faça login para avaliar
              </Button>
            ) : (
              <Button type="submit" loading={isSubmitting} className="bg-violet-600 hover:bg-violet-500 text-white font-bold h-12 px-8 shadow-[0_0_20px_rgba(139,92,246,0.3)] btn-shimmer">
                Enviar Avaliação <Send className="ml-2 h-4 w-4 relative z-20" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
