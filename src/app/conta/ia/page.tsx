import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import AiConciergeClient from "@/components/chat/AiConciergeClient";

export const metadata = {
  title: "Concierge IA | ConectaParts",
};

export default async function AiConciergePage() {
  const session = await getCurrentSession();
  
  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-200">
          Concierge IA Inteligente
        </h1>
        <p className="text-muted-foreground mt-2">
          Nosso assistente virtual tem acesso direto ao estoque das lojas e à sua garagem. 
          Use para achar a peça exata que você procura sem esforço!
        </p>
      </div>

      <AiConciergeClient />
    </div>
  );
}
