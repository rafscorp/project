import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import ChatInterface from "@/components/chat/ChatInterface";

export const metadata = {
  title: "Mensagens da Loja | ConectaParts",
};

interface ChatPageProps {
  searchParams: Promise<{ customerId?: string }>;
}

export default async function StoreChatPage({ searchParams }: ChatPageProps) {
  const session = await getSession();
  if (!session || !session.storeId) {
    redirect("/login");
  }

  const params = await searchParams;
  const initialCustomerId = params.customerId || "";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Mensagens do Balcão</h1>
        <p className="text-muted-foreground mt-1">
          Negocie peças e atenda seus clientes em tempo real.
        </p>
      </div>

      <ChatInterface 
        userId={session.storeId} 
        role="store" 
        // Se houver um customerId na URL, o ChatInterface pode focar nele
        initialRoomId={initialCustomerId ? `room-${session.storeId}-${initialCustomerId}` : undefined} 
      />
    </div>
  );
}
