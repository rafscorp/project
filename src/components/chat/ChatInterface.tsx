"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Send, UserCircle2, Store as StoreIcon, AlertCircle, Clock, PackageSearch } from "lucide-react";
import { getChatRooms, getMessages, createMessage } from "@/app/actions/chat";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ChatRoom {
  id: string;
  updatedAt: Date;
  customer: { 
    id: string; 
    name: string; 
    avatarUrl: string | null;
    birthDate?: string | Date | null;
    city?: string | null;
    createdAt?: string | Date;
  };
  store: { id: string; name: string; logoUrl: string | null };
  product: { id: string; name: string; imageUrl: string | null } | null;
  messages: Message[];
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

function calculateAge(birthDateString?: string | Date | null) {
  if (!birthDateString) return "Não informada";
  const birthDate = new Date(birthDateString);
  const difference = Date.now() - birthDate.getTime();
  const ageDate = new Date(difference);
  return Math.abs(ageDate.getUTCFullYear() - 1970) + " anos";
}

interface ChatInterfaceProps {
  userId: string;
  role: "customer" | "store";
  initialRoomId?: string;
}

export default function ChatInterface({ userId, role, initialRoomId }: ChatInterfaceProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(initialRoomId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sincroniza sala ativa se vier por prop (ex: clique na vitrine)
  useEffect(() => {
    if (initialRoomId) {
      setActiveRoomId(initialRoomId);
    }
  }, [initialRoomId]);

  // Inicializar Socket.io
  useEffect(() => {
    // Para funcionar em Vercel/VPS, precisamos inicializar o endpoint
    fetch("/api/socket/io").finally(() => {
      const newSocket = io({
        path: "/api/socket/io",
        addTrailingSlash: false,
      });

      newSocket.on("connect", () => console.log("Socket conectado"));
      
      newSocket.on("receive-message", (msg: Message & { roomId: string }) => {
        if (msg.senderId === userId) return; // Ignora as próprias mensagens recebidas pelo socket
        
        setMessages((prev) => {
          if (activeRoomId === msg.roomId) {
            return [...prev, msg];
          }
          return prev;
        });

        // Atualiza o preview na lista de salas
        setRooms((prev) => prev.map(room => {
          if (room.id === msg.roomId) {
            return { ...room, messages: [msg], updatedAt: new Date() };
          }
          return room;
        }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      });

      setSocket(newSocket);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [userId, activeRoomId]);

  // Carregar lista de conversas
  useEffect(() => {
    async function loadRooms() {
      const res = await getChatRooms(userId, role);
      if (res.success && res.rooms) {
        setRooms(res.rooms as any);
      }
    }
    loadRooms();
  }, [userId, role]);

  // Entrar numa sala e carregar mensagens
  useEffect(() => {
    if (!activeRoomId || !socket) return;
    
    socket.emit("join-room", activeRoomId);

    async function loadHistory() {
      const res = await getMessages(activeRoomId!);
      if (res.success && res.messages) {
        setMessages(res.messages as any);
      }
    }
    loadHistory();
  }, [activeRoomId, socket]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoomId) return;

    const content = inputText.trim();
    setInputText(""); // Limpa input rápido (UX)

    // Optimistic Update
    const tempMsg: Message = {
      id: "temp-" + Date.now(),
      senderId: userId,
      content,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, tempMsg]);

    const res = await createMessage(activeRoomId, userId, content);
    
    if (res.success && socket) {
      socket.emit("send-message", { ...res.message, roomId: activeRoomId });
      
      // Atualiza o preview da sala atual no menu esquerdo
      setRooms((prev) => prev.map(room => {
        if (room.id === activeRoomId) {
          return { ...room, messages: [res.message as any], updatedAt: new Date() };
        }
        return room;
      }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    }
  };

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  return (
    <div className="flex h-[75vh] min-h-[600px] border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
      
      {/* Sidebar - Lista de Salas */}
      <div className="w-1/3 border-r border-border bg-muted/10 flex flex-col">
        <div className="p-4 border-b border-border bg-card">
          <h2 className="font-bold text-lg">Mensagens</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma conversa ainda.</p>
            </div>
          ) : (
            rooms.map((room) => {
              const otherPartyName = role === "customer" ? room.store.name : room.customer.name;
              const lastMessage = room.messages[0]?.content || "Iniciou uma conversa.";
              
              return (
                <button
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  className={`w-full text-left p-4 border-b border-border hover:bg-muted/50 transition-colors flex items-center gap-4
                    ${activeRoomId === room.id ? "bg-amber-500/10 border-l-4 border-l-amber-500" : "border-l-4 border-l-transparent"}`}
                >
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center shrink-0 border border-border overflow-hidden">
                    {role === "customer" ? <StoreIcon className="w-6 h-6 text-muted-foreground" /> : <UserCircle2 className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate text-foreground">{otherPartyName}</h3>
                    <p className="text-xs text-muted-foreground truncate">{lastMessage}</p>
                    {room.product && (
                      <p className="text-[10px] text-amber-500 truncate mt-1 flex items-center gap-1">
                        <PackageSearch className="w-3 h-3" />
                        {room.product.name}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background relative">
        {activeRoom ? (
          <>
            {/* Header da Sala */}
            <div className="p-4 border-b border-border bg-card flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                 {role === "customer" ? <StoreIcon className="w-5 h-5 text-amber-500" /> : <UserCircle2 className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <h3 className="font-bold text-foreground">
                  {role === "customer" ? activeRoom.store.name : activeRoom.customer.name}
                </h3>
                {activeRoom.product && (
                  <p className="text-xs text-muted-foreground">Sobre: {activeRoom.product.name}</p>
                )}
              </div>
            </div>

            {/* Lista de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === userId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div 
                      className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                        isMe 
                        ? "bg-amber-500 text-black rounded-tr-sm" 
                        : "bg-muted border border-border text-foreground rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card flex items-end gap-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escreva sua mensagem..."
                className="flex-1 h-12 rounded-xl bg-muted/50 border-transparent focus-visible:ring-amber-500 focus-visible:bg-background"
              />
              <Button type="submit" disabled={!inputText.trim()} className="h-12 w-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-black shrink-0 p-0">
                <Send className="w-5 h-5 ml-1" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <StoreIcon className="w-16 h-16 mb-4 opacity-20" />
            <p>Selecione uma conversa ao lado para começar.</p>
          </div>
        )}
      </div>

      {/* Painel do Perfil do Cliente (Apenas Lojistas) */}
      {role === "store" && activeRoom && (
        <div className="w-64 border-l border-border bg-zinc-900/50 p-6 space-y-6 hidden md:block shrink-0">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center mx-auto overflow-hidden">
              {activeRoom.customer.avatarUrl ? (
                <img src={activeRoom.customer.avatarUrl} alt={activeRoom.customer.name} className="w-full h-full object-cover" />
              ) : (
                <UserCircle2 className="w-12 h-12 text-zinc-500" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-white truncate">{activeRoom.customer.name}</h4>
              <p className="text-xs text-muted-foreground">Cliente Agury</p>
            </div>
          </div>

          <div className="border-t border-zinc-800/80 pt-4 space-y-4 text-xs">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Idade</p>
              <p className="font-semibold text-white mt-0.5">{calculateAge(activeRoom.customer.birthDate)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Cidade</p>
              <p className="font-semibold text-white mt-0.5">{activeRoom.customer.city || "Não informada"}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Cadastrado desde</p>
              <p className="font-semibold text-white mt-0.5">
                {activeRoom.customer.createdAt ? new Date(activeRoom.customer.createdAt).toLocaleDateString("pt-BR") : "Não informada"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
