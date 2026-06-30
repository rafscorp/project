"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle, Send, Bookmark, MapPin, Store as StoreIcon, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface StoryStore {
  id: string;
  name: string;
  logoUrl: string | null;
  slug: string;
}

interface FeedPost {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  vehicleTags: string[];
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    city: string;
    state: string;
  };
}

interface Props {
  stories: StoryStore[];
  posts: FeedPost[];
}

export default function InstagramFeedClient({ stories, posts }: Props) {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 pt-4">
      
      {/* Stories Section */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-muted-foreground px-4 mb-3">Lojas em Destaque</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide snap-x">
          {stories.map((store, i) => (
            <Link href={`/loja/${store.slug}`} key={store.id} className="snap-start flex flex-col items-center gap-2 group shrink-0">
              <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-orange-500 to-pink-500">
                <div className="w-full h-full rounded-full bg-background p-[2px]">
                  <div className="w-full h-full rounded-full bg-muted overflow-hidden flex items-center justify-center relative">
                    {store.logoUrl ? (
                      <Image src={store.logoUrl} alt={store.name} fill className="object-cover" />
                    ) : (
                      <StoreIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs text-foreground font-medium truncate w-16 text-center">
                {store.name.split(" ")[0]}
              </span>
            </Link>
          ))}
          {/* MOCK STORY IF EMPTY */}
          {stories.length === 0 && Array.from({length: 6}).map((_, i) => (
             <div key={i} className="flex flex-col items-center gap-2 shrink-0 opacity-50">
                <div className="w-16 h-16 rounded-full border-2 border-border bg-muted flex items-center justify-center">
                  <StoreIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="w-12 h-2 bg-muted rounded-full"></div>
             </div>
          ))}
        </div>
      </div>

      {/* Feed (Posts) */}
      <div className="space-y-8">
        {posts.map((post, i) => (
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={post.id} 
            className="bg-card border-y sm:border sm:rounded-2xl border-border overflow-hidden shadow-sm"
          >
            {/* Post Header */}
            <div className="flex items-center justify-between p-4">
              <Link href={`/loja/${post.store.slug}`} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center relative">
                  {post.store.logoUrl ? (
                    <Image src={post.store.logoUrl} alt={post.store.name} fill className="object-cover" />
                  ) : (
                    <StoreIcon className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm text-foreground hover:underline">{post.store.name}</span>
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {post.store.city}, {post.store.state}
                  </span>
                </div>
              </Link>
              <Button variant="ghost" size="sm" className="text-amber-500 font-semibold h-8">
                Ver Loja
              </Button>
            </div>

            {/* Post Image */}
            <div 
              className="w-full aspect-square bg-muted relative flex items-center justify-center cursor-pointer group"
              onDoubleClick={() => toggleLike(post.id)}
            >
              {post.imageUrl ? (
                <Image src={post.imageUrl} alt={post.name} fill className="object-cover" />
              ) : (
                <div className="text-center p-6">
                  <div className="w-24 h-24 bg-background/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <StoreIcon className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-foreground mb-2">{post.name}</h3>
                  <p className="text-amber-500 font-bold text-xl">{formatCurrency(post.price)}</p>
                </div>
              )}
              
              {/* Like animation overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity">
                <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-2xl scale-50 group-active:scale-100 transition-transform duration-300" />
              </div>
            </div>

            {/* Post Actions */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleLike(post.id)} className="hover:opacity-70 transition-opacity">
                    <Heart className={`w-7 h-7 ${likedPosts.has(post.id) ? "fill-red-500 text-red-500" : "text-foreground"}`} />
                  </button>
                  <Link href={`/conta/chat?store=${post.store.id}&product=${post.id}`}>
                    <button className="hover:opacity-70 transition-opacity">
                      <MessageCircle className="w-7 h-7 text-foreground" />
                    </button>
                  </Link>
                  <button className="hover:opacity-70 transition-opacity">
                    <Send className="w-7 h-7 text-foreground" />
                  </button>
                </div>
                <button className="hover:opacity-70 transition-opacity">
                  <Bookmark className="w-7 h-7 text-foreground" />
                </button>
              </div>

              {/* Likes count */}
              <div className="font-bold text-sm mb-2 text-foreground">
                {likedPosts.has(post.id) ? "Você e outras 34 pessoas curtiram" : "34 curtidas"}
              </div>

              {/* Post Description */}
              <div className="text-sm text-foreground">
                <span className="font-bold mr-2 hover:underline cursor-pointer">{post.store.name}</span>
                {post.description || `Peça original, qualidade garantida. ${post.name} disponível em nossa loja!`}
              </div>

              {/* Tags de Veículo */}
              {post.vehicleTags && post.vehicleTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.vehicleTags.map(tag => (
                    <span key={tag} className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-md font-medium border border-amber-500/20">
                      #{tag.replace(/\s+/g, "")}
                    </span>
                  ))}
                </div>
              )}

              {/* Data (Simulada) */}
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-3 font-semibold">
                Há 2 horas
              </div>
            </div>
          </motion.article>
        ))}

        {/* MOCK POST IF EMPTY */}
        {posts.length === 0 && (
           <div className="text-center p-12 bg-card border border-border rounded-2xl">
             <StoreIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
             <h3 className="font-bold text-lg">Seu feed está vazio</h3>
             <p className="text-muted-foreground text-sm mt-2">Nenhum produto foi publicado pelas lojas ainda. Volte mais tarde!</p>
           </div>
        )}
      </div>
    </div>
  );
}
