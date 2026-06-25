"use client";

import { useState, useEffect, useRef } from "react";
import { QuoteStatus, UserRole } from "@prisma/client";
import { MessageCircle, CheckCircle2, Send, Store, Car, ChevronLeft, Handshake, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

interface Quote {
  id: string;
  vehicle: string;
  year: string | null;
  part: string;
  status: QuoteStatus;
  priceOffer: number | null;
  createdAt: Date;
  store: {
    name: string;
    slug: string;
    city: string;
    state: string;
  };
}

export function CustomerQuotesClient({ initialQuotes }: { initialQuotes: any[] }) {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [acting, setActing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeQuote) return;
    const fetchMessages = async () => {
      const res = await fetch(`/api/quotes/${activeQuote.id}/messages`);
      if (res.ok) setMessages(await res.json());
      scrollToBottom();
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Polling simples
    return () => clearInterval(interval);
  }, [activeQuote]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeQuote) return;

    setSending(true);
    try {
      const res = await fetch(`/api/quotes/${activeQuote.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages([...messages, msg]);
        setNewMessage("");
        scrollToBottom();
      }
    } finally {
      setSending(false);
    }
  };

  const handleAction = async (action: "ACCEPTED" | "REJECTED") => {
    if (!activeQuote) return;
    setActing(true);
    try {
      const res = await fetch(`/api/quotes/${activeQuote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        const updated = await res.json();
        setQuotes(quotes.map(q => q.id === activeQuote.id ? { ...q, ...updated } : q));
        setActiveQuote({ ...activeQuote, ...updated });
        
        await fetch(`/api/quotes/${activeQuote.id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: action === "ACCEPTED" ? "🎉 Orçamento ACEITO! Passarei na loja em breve." : "❌ Orçamento Recusado." }),
        });
        const msgs = await fetch(`/api/quotes/${activeQuote.id}/messages`).then(r => r.json());
        setMessages(msgs);
        scrollToBottom();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao realizar ação");
    } finally {
      setActing(false);
    }
  };

  if (quotes.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-white/5 bg-zinc-900/40 text-center">
        <MessageCircle className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
        <h3 className="font-display text-xl font-bold text-white mb-2">Sua agenda está vazia</h3>
        <p className="text-zinc-400 mb-6">Você ainda não pediu nenhuma peça sob encomenda.</p>
        <Link href="/lojas">
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8">
            Encontrar Lojas
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[700px] rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
      {/* Sidebar - Lista de Chats */}
      <div className={`w-full md:w-1/3 border-r border-zinc-800 flex flex-col bg-zinc-900/30 ${activeQuote ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="font-bold text-white">Lojas ({quotes.length})</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {quotes.map(quote => (
            <button 
              key={quote.id} 
              onClick={() => setActiveQuote(quote)}
              className={`w-full text-left p-4 border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/50 ${activeQuote?.id === quote.id ? 'bg-zinc-800/80 border-l-4 border-l-emerald-500' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-zinc-100 truncate flex-1 flex items-center"><Store className="h-4 w-4 mr-1 text-emerald-500" /> {quote.store.name}</span>
                <span className="text-xs text-zinc-500 ml-2">{new Date(quote.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <p className="text-sm text-emerald-400 font-medium truncate">{quote.part}</p>
              
              <div className="mt-2 flex">
                {quote.status === "PENDING" && <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full uppercase font-bold">Aguardando Loja</span>}
                {quote.status === "ANSWERED" && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold">Loja Respondeu</span>}
                {quote.status === "ACCEPTED" && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold">Agendado</span>}
                {quote.status === "REJECTED" && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase font-bold">Recusado</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Área do Chat */}
      <div className={`flex-1 flex flex-col bg-[#0a0a0c] relative ${!activeQuote ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {!activeQuote ? (
          <div className="text-center text-zinc-600">
            <MessageCircle className="mx-auto h-16 w-16 mb-4 opacity-50" />
            <p>Selecione uma loja ao lado para ver o chat</p>
          </div>
        ) : (
          <>
            {/* Header do Chat */}
            <div className="h-16 px-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveQuote(null)} className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Store className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    <Link href={`/loja/${activeQuote.store.slug}`} className="hover:text-emerald-400">{activeQuote.store.name}</Link>
                  </h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> {activeQuote.store.city}</p>
                </div>
              </div>
              
              <div className="hidden sm:block">
                <span className="text-xs font-bold text-zinc-500 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
                  <Car className="h-3 w-3 inline mr-1" /> {activeQuote.vehicle} - {activeQuote.part}
                </span>
              </div>
            </div>

            {/* Banner de Aceite Flutuante (Se a loja respondeu) */}
            {activeQuote.status === "ANSWERED" && activeQuote.priceOffer && (
              <div className="absolute top-16 left-0 right-0 bg-emerald-950/80 backdrop-blur border-b border-emerald-500/20 p-3 shadow-xl z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-emerald-400 font-bold block uppercase tracking-wider">A Loja enviou o preço</span>
                  <span className="text-lg font-black text-white">R$ {activeQuote.priceOffer.toFixed(2)}</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="ghost" onClick={() => handleAction("REJECTED")} disabled={acting} className="text-zinc-400 hover:text-red-400 flex-1 sm:flex-none">Recusar</Button>
                  <Button onClick={() => handleAction("ACCEPTED")} disabled={acting} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex-1 sm:flex-none">
                    <Handshake className="w-4 h-4 mr-2" /> Aceitar Orçamento
                  </Button>
                </div>
              </div>
            )}

            {/* Banner de Sucesso */}
            {activeQuote.status === "ACCEPTED" && (
              <div className="absolute top-16 left-0 right-0 bg-emerald-500/10 backdrop-blur border-b border-emerald-500/20 p-3 shadow-xl z-10 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-bold">Orçamento Aceito! Pode ir buscar sua peça.</span>
              </div>
            )}

            {/* Corpo do Chat */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${activeQuote.status === "ANSWERED" ? "pt-24" : activeQuote.status === "ACCEPTED" ? "pt-16" : ""}`}>
              <div className="text-center">
                <span className="bg-zinc-900 text-zinc-500 text-xs px-3 py-1 rounded-full border border-zinc-800">
                  Você solicitou em {new Date(activeQuote.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              <div className="flex justify-end">
                <div className="bg-emerald-500/10 text-emerald-100 rounded-2xl rounded-tr-sm p-4 max-w-[85%] sm:max-w-[70%] text-sm shadow-md border border-emerald-500/20">
                  <p className="font-bold text-emerald-400 mb-1">Seu Pedido</p>
                  <p><strong>Veículo:</strong> {activeQuote.vehicle} {activeQuote.year}</p>
                  <p><strong>Peça:</strong> {activeQuote.part}</p>
                </div>
              </div>

              {messages.map((msg) => {
                const isMine = msg.sender.role === "CUSTOMER";
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-2xl p-3 max-w-[85%] sm:max-w-[70%] text-sm shadow-md ${
                      isMine 
                        ? 'bg-zinc-800 text-zinc-200 rounded-tr-sm border border-zinc-700/50' 
                        : 'bg-zinc-900 text-zinc-200 rounded-tl-sm border border-zinc-800'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <span className={`text-[10px] block mt-1 text-right text-zinc-500`}>
                        {new Date(msg.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-zinc-900/80 backdrop-blur border-t border-zinc-800 shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Escreva para a loja..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || sending}
                  className="rounded-full w-12 h-12 p-0 bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 flex items-center justify-center"
                >
                  <Send className="h-5 w-5 ml-1" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
