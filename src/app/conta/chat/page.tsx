import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import ChatInterface from "@/components/chat/ChatInterface";
import { findOrCreateChatRoom } from "@/app/actions/chat";

export const metadata = {
  title: "Central de Mensagens | ConectaParts",
};

interface ChatPageProps {
  searchParams: Promise<{ storeId?: string; productId?: string }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const session = await getCurrentSession();
  if (!session || !session.user) {
    redirect("/login");
  }

  const params = await searchParams;
  let initialRoomId = "";

  if (params.storeId) {
    // Busca ou cria a sala com a loja específica
    const res = await findOrCreateChatRoom(session.user.id, params.storeId, params.productId);
    if (res.success && res.room) {
      initialRoomId = res.room.id;
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mensagens</h1>
        <p className="text-muted-foreground mt-2">
          Negocie peças diretamente com as lojas em tempo real.
        </p>
      </div>

      <ChatInterface 
        userId={session.user.id} 
        role="customer" 
        initialRoomId={initialRoomId || undefined} 
      />
    </div>
  );
}
