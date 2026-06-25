import prisma from "@/lib/db/prisma";
import PremiumLandingPage from "@/components/marketing/PremiumLandingPage";

// Force dynamic because top stores change frequently
export const dynamic = 'force-dynamic';

export default async function Page() {
  // Fetch Top 5 Stores based on average rating
  const topStores = await prisma.store.findMany({
    where: { active: true },
    orderBy: [
      { averageRating: 'desc' },
      { totalReviews: 'desc' }
    ],
    take: 5,
    select: {
      id: true,
      name: true,
      slug: true,
      averageRating: true,
      totalReviews: true,
      city: true,
      state: true,
      logoUrl: true,
      // Pega o melhor comentário (o mais recente com 5 estrelas)
      reviews: {
        where: { rating: { gte: 4 }, active: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { comment: true, rating: true, user: { select: { name: true } } }
      }
    }
  });

  const plans = await prisma.subscriptionPlan.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' }
  });

  return <PremiumLandingPage topStores={topStores} plans={plans} />;
}
