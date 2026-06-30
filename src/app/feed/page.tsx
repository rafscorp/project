import { getFeedData } from "@/app/actions/feed";
import InstagramFeedClient from "@/components/cliente/InstagramFeedClient";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Explorar Peças | ConectaParts",
};

export default async function FeedPage() {
  const session = await getCurrentSession();
  
  // Como é B2B2C, vamos permitir que visitantes vejam o feed, mas se não tiver logado avisamos
  // Mas por segurança, para testar a rota completa, redirecionamos se deslogado
  if (!session) {
    redirect("/login");
  }

  const response = await getFeedData();
  const stories = response.success && response.storyStores ? response.storyStores : [];
  const posts = response.success && response.feedPosts ? response.feedPosts : [];

  return (
    <div className="min-h-screen bg-background">
      <InstagramFeedClient stories={stories} posts={posts} />
    </div>
  );
}
