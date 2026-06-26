"use client";

import { useState, useEffect, useRef } from "react";
import { QuoteStatus, UserRole } from "@prisma/client";
// ... 
import { MessageCircle, CheckCircle2, Clock, Send, DollarSign, UserCircle, Car, ChevronLeft, Check, CheckCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
  sender: { id: string; name: string; role: string };
  status?: "SENDING" | "ERROR" | "SENT" | "READ";
}

interface Quote {
  id: string;
  vehicle: string;
  year: string | null;
  part: string;
  status: QuoteStatus;
  priceOffer: number | null;
  createdAt: Date;
  customer: {
    id: string;
    name: string;
    email: string;
  };
}

export function QuotesClient({ initialQuotes, isSoftLocked = false }: { initialQuotes: any[], isSoftLocked?: boolean }) {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceInput, setPriceInput] = useState("");

  // Carregar mensagens quando seleciona um chat
  useEffect(() => {
    if (!activeQuote) return;
    const fetchMessages = async () => {
      const res = await fetch(`/api/quotes/${activeQuote.id}/messages`);
      if (res.ok) {
        const dbMsgs = await res.json();
        const formattedMsgs = dbMsgs.map((m: any) => ({
          ...m,
          status: m.isRead ? "READ" : "SENT"
        }));
        
        setMessages(prev => {
          // Preserva mensagens locais que estão enviando ou falharam
          const localMsgs = prev.filter(m => m.status === "SENDING" || m.status === "ERROR");
          // Removemos mensagens locais que já chegaram no DB (match by content para simplificar)
          const newLocalMsgs = localMsgs.filter(l => !formattedMsgs.some((db: any) => db.content === l.content && Date.now() - new Date(l.createdAt).getTime() < 10000));
          return [...formattedMsgs, ...newLocalMsgs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });
      }
    };
    fetchMessages();
    setTimeout(scrollToBottom, 100);
    
    const interval = setInterval(fetchMessages, 3000); // Polling mais rápido para a sensação real-time
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

    const tempId = `temp-${Date.now()}`;
    const messageContent = newMessage;
    
    // Optimistic UI update
    const tempMsg: Message = {
      id: tempId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      status: "SENDING",
      sender: { id: "me", name: "Loja", role: "STORE_OWNER" }
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage("");
    scrollToBottom();

    try {
      const res = await fetch(`/api/quotes/${activeQuote.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
      });
      
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => prev.map(m => m.id === tempId ? { ...msg, status: "SENT" } : m));
      } else {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: "ERROR" } : m));
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: "ERROR" } : m));
    }
  };

  const handleSetPrice = async () => {
    if (!priceInput || !activeQuote) return;
    try {
      const res = await fetch(`/api/quotes/${activeQuote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceOffer: priceInput, status: "ANSWERED" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setQuotes(quotes.map(q => q.id === activeQuote.id ? { ...q, ...updated } : q));
        setActiveQuote({ ...activeQuote, ...updated });
        setShowPriceModal(false);
        // Manda uma mensagem automática no chat
        await fetch(`/api/quotes/${activeQuote.id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: `✅ Enviei uma oferta oficial de R$ ${Number(priceInput).toFixed(2)}.` }),
        });
        const msgs = await fetch(`/api/quotes/${activeQuote.id}/messages`).then(r => r.json());
        setMessages(msgs.map((m: any) => ({ ...m, status: m.isRead ? "READ" : "SENT" })));
        scrollToBottom();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (quotes.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-border-subtle bg-panel/40 text-center">
        <MessageCircle className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
        <h3 className="font-display text-xl font-bold text-foreground mb-2">Nenhum pedido de orçamento</h3>
        <p className="text-muted-foreground">Quando os clientes pedirem peças, os chats aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[700px] rounded-2xl border border-border-subtle bg-background overflow-hidden shadow-2xl">
      {/* Sidebar - Lista de Chats */}
      <div className={`w-full md:w-1/3 border-r border-border-subtle flex flex-col bg-panel/30 ${activeQuote ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border-subtle bg-panel/50">
          <h2 className="font-bold text-foreground">Conversas ({quotes.length})</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {quotes.map(quote => (
            <button 
              key={quote.id} 
              onClick={() => setActiveQuote(quote)}
              className={`w-full text-left p-4 border-b border-border-subtle/50 transition-colors hover:bg-zinc-800/50 ${activeQuote?.id === quote.id ? 'bg-zinc-800/80 border-l-4 border-l-emerald-500' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-zinc-100 truncate flex-1">{quote.customer.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{new Date(quote.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <p className="text-sm text-amber-400 font-medium truncate">{quote.part}</p>
              <p className="text-xs text-muted-foreground truncate mt-1">{quote.vehicle} {quote.year}</p>
              
              <div className="mt-2 flex">
                {quote.status === "PENDING" && <span className="text-[10px] bg-zinc-800 text-muted-foreground px-2 py-0.5 rounded-full uppercase font-bold">Pendente</span>}
                {quote.status === "ANSWERED" && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase font-bold">Oferta Enviada</span>}
                {quote.status === "ACCEPTED" && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold">Aceito</span>}
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
            <p>Selecione uma conversa ao lado para responder</p>
          </div>
        ) : (
          <>
            {/* Header do Chat */}
            <div className="h-16 px-4 border-b border-border-subtle bg-panel/80 backdrop-blur flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveQuote(null)} className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <UserCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{activeQuote.customer.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Car className="h-3 w-3" /> {activeQuote.vehicle} - {activeQuote.part}</p>
                </div>
              </div>
              
              <div>
                {activeQuote.status === "ACCEPTED" ? (
                  <span className="flex items-center text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4 mr-2"/> Fechado (R$ {activeQuote.priceOffer?.toFixed(2)})
                  </span>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => setShowPriceModal(true)}
                    disabled={isSoftLocked}
                    className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold disabled:opacity-50"
                  >
                    <DollarSign className="w-4 h-4 mr-1"/> Enviar Oferta
                  </Button>
                )}
              </div>
            </div>

            {/* Modal de Enviar Preço */}
            {showPriceModal && (
              <div className="absolute top-16 left-0 right-0 bg-panel border-b border-border-subtle p-4 shadow-xl z-10 animate-in slide-in-from-top-4">
                <div className="flex items-end gap-3 max-w-sm ml-auto">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground font-bold mb-1 block">Valor da Peça (R$)</label>
                    <input 
                      type="number" 
                      value={priceInput}
                      onChange={e => setPriceInput(e.target.value)}
                      placeholder="Ex: 450.00"
                      className="w-full bg-background border border-zinc-700 rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <Button onClick={handleSetPrice} className="bg-emerald-600 hover:bg-emerald-500 text-white">Confirmar</Button>
                  <Button variant="ghost" onClick={() => setShowPriceModal(false)} className="text-muted-foreground">Cancelar</Button>
                </div>
              </div>
            )}

            {/* Corpo do Chat */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center">
                <span className="bg-panel text-muted-foreground text-xs px-3 py-1 rounded-full border border-border-subtle">
                  Pedido iniciado em {new Date(activeQuote.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              <div className="flex justify-start">
                <div className="bg-zinc-800 text-zinc-200 rounded-2xl rounded-tl-sm p-4 max-w-[85%] sm:max-w-[70%] text-sm shadow-md border border-zinc-700/50">
                  <p className="font-bold text-amber-400 mb-1">Pedido Inicial</p>
                  <p><strong>Veículo:</strong> {activeQuote.vehicle} {activeQuote.year}</p>
                  <p><strong>Peça:</strong> {activeQuote.part}</p>
                </div>
              </div>

              {messages.map((msg) => {
                const isMine = msg.sender.role === "STORE_OWNER" || msg.sender.role === "STORE_STAFF";
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-2xl p-3 max-w-[85%] sm:max-w-[70%] text-sm shadow-md flex flex-col ${
                      isMine 
                        ? 'bg-amber-500/10 text-amber-100 rounded-tr-sm border border-amber-500/20' 
                        : 'bg-zinc-800 text-zinc-200 rounded-tl-sm border border-zinc-700/50'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-amber-500/60' : 'text-muted-foreground'}`}>
                        <span className="text-[10px]">
                          {new Date(msg.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        
                        {/* WhatsApp Style Read Receipts for own messages */}
                        {isMine && (
                          <span className="ml-1">
                            {msg.status === "SENDING" && <Clock className="w-3 h-3 text-amber-500/40" />}
                            {msg.status === "ERROR" && <AlertCircle className="w-3 h-3 text-red-500" title="Falha ao enviar" />}
                            {msg.status === "SENT" && <Check className="w-3.5 h-3.5 text-amber-500/60" />}
                            {msg.status === "READ" && <CheckCheck className="w-3.5 h-3.5 text-blue-400" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-panel/80 backdrop-blur border-t border-border-subtle shrink-0">
              {isSoftLocked ? (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-center p-3 rounded-xl font-bold flex flex-col items-center justify-center">
                  <p>Renove seu plano para responder este cliente.</p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-background border border-border-subtle rounded-full px-5 py-3 text-sm text-foreground focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                    disabled={activeQuote.status === "ACCEPTED" || activeQuote.status === "REJECTED"}
                  />
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim() || activeQuote.status === "ACCEPTED" || activeQuote.status === "REJECTED"}
                    className="rounded-full w-12 h-12 p-0 bg-amber-500 hover:bg-amber-400 text-zinc-950 shrink-0 flex items-center justify-center transition-transform active:scale-95"
                  >
                    <Send className="h-5 w-5 ml-1" />
                  </Button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
