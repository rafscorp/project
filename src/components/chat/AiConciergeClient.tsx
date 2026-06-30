"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { askConcierge } from "@/app/actions/ai";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
}

export default function AiConciergeClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Olá! Eu sou o Concierge Inteligente da ConectaParts. ⚡\n\nPosso pesquisar peças automaticamente baseadas no seu carro, ou tirar dúvidas. O que você precisa hoje?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    
    // Add User message
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: userText };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await askConcierge(userText);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: response.success && response.answer ? response.answer : (response.error || "Tive um problema de comunicação com o servidor cerebral.")
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: "Erro fatal ao acessar o Cérebro IA." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestionChips = [
    "Procuro peças para meu carro",
    "Preciso de um kit de suspensão",
    "Como funciona a garantia?"
  ];

  return (
    <div className="flex flex-col h-[75vh] min-h-[600px] border border-amber-500/30 rounded-3xl overflow-hidden bg-card shadow-lg shadow-amber-500/5 relative">
      
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="p-4 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center p-[2px] shadow-md shadow-amber-500/20">
            <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div>
            <h2 className="font-bold text-foreground flex items-center gap-2">
              Concierge <Sparkles className="w-3 h-3 text-amber-500" />
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-muted-foreground">Motor IA Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 z-10 scrollbar-hide" ref={scrollRef}>
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Avatar */}
                <div className="shrink-0 mt-1">
                  {msg.role === "ai" ? (
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-amber-500" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-2xl whitespace-pre-wrap ${
                  msg.role === "user" 
                    ? "bg-amber-500 text-black rounded-tr-sm shadow-md" 
                    : "bg-muted/80 backdrop-blur-sm border border-border/50 text-foreground rounded-tl-sm shadow-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start w-full"
            >
              <div className="flex gap-3 max-w-[75%]">
                <div className="shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 text-foreground rounded-tl-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-card/80 backdrop-blur-md border-t border-border z-10 space-y-3">
        {/* Suggestion Chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {suggestionChips.map(chip => (
            <button 
              key={chip}
              onClick={() => setInput(chip)}
              className="whitespace-nowrap px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-500/10 transition-colors flex items-center gap-1 shrink-0"
            >
              {chip} <ArrowRight className="w-3 h-3" />
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Pergunte ao concierge..."
            className="flex-1 h-14 pl-5 pr-14 rounded-full bg-background border-border focus-visible:ring-amber-500 shadow-sm"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()} 
            className="absolute right-1 top-1 h-12 w-12 rounded-full bg-amber-500 hover:bg-amber-600 text-black p-0 transition-transform active:scale-95"
          >
            <Send className="w-5 h-5 ml-1" />
          </Button>
        </form>
      </div>
    </div>
  );
}
