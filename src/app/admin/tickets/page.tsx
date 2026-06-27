"use client";

import { useState } from "react";
import { LifeBuoy, Search, Filter, MessageSquare, CheckCircle2, Clock } from "lucide-react";
import toast from "react-hot-toast";

// Interface estática para fins de demonstração UX
const MOCK_TICKETS = [
  { id: "T-1049", store: "Auto Center SP", subject: "Problema no Webhook", status: "OPEN", priority: "HIGH", date: "Há 2 horas" },
  { id: "T-1048", store: "Oficina do João", subject: "Dúvida sobre mensalidade", status: "PENDING", priority: "LOW", date: "Ontem" },
  { id: "T-1047", store: "Pneus & Cia", subject: "Erro ao gerar PIX de cliente", status: "RESOLVED", priority: "CRITICAL", date: "12/03/2026" },
];

export default function AdminTicketsPage() {
  const [filter, setFilter] = useState("ALL");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-foreground flex items-center gap-3">
            <LifeBuoy className="h-8 w-8 text-blue-500" /> Suporte & Chamados
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie as dúvidas e problemas relatados pelas Lojas da plataforma.</p>
        </div>
      </div>

      {/* Stats e Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-panel border border-border-subtle rounded-2xl p-6">
          <p className="text-sm font-bold text-muted-foreground uppercase mb-1">Abertos</p>
          <h2 className="text-3xl font-black text-foreground">14</h2>
        </div>
        <div className="bg-panel border border-border-subtle rounded-2xl p-6">
          <p className="text-sm font-bold text-muted-foreground uppercase mb-1">Aguardando Resposta</p>
          <h2 className="text-3xl font-black text-amber-500">5</h2>
        </div>
        <div className="md:col-span-2 bg-panel border border-border-subtle rounded-2xl p-6 flex flex-col justify-center">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl px-3 py-2">
            <Search className="h-5 w-5 text-muted-foreground mr-2" />
            <input 
              type="text" 
              placeholder="Buscar chamado por ID, Loja ou Assunto..." 
              className="bg-transparent border-none focus:outline-none text-foreground text-sm w-full"
            />
          </div>
        </div>
      </div>

      <div className="bg-panel border border-border-subtle rounded-2xl overflow-hidden">
        <div className="border-b border-border-subtle bg-zinc-50 dark:bg-zinc-800/30 px-6 py-4 flex gap-4 overflow-x-auto">
          <button className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${filter === "ALL" ? "bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800"}`} onClick={() => setFilter("ALL")}>Todos</button>
          <button className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${filter === "OPEN" ? "bg-blue-500 text-white" : "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20"}`} onClick={() => setFilter("OPEN")}><Clock className="h-4 w-4"/> Abertos</button>
          <button className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${filter === "RESOLVED" ? "bg-emerald-500 text-white" : "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"}`} onClick={() => setFilter("RESOLVED")}><CheckCircle2 className="h-4 w-4"/> Resolvidos</button>
        </div>
        
        <div className="divide-y divide-border-subtle">
          {MOCK_TICKETS.filter(t => filter === "ALL" || t.status === filter).map(ticket => (
            <div key={ticket.id} className="p-6 flex flex-col sm:flex-row gap-4 justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors group cursor-pointer" onClick={() => toast.success("Feature visual para painel Admin.")}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-border-subtle">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm font-bold text-muted-foreground">{ticket.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      ticket.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                      ticket.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-zinc-500/10 text-zinc-500'
                    }`}>{ticket.priority}</span>
                  </div>
                  <h3 className="font-bold text-foreground text-lg group-hover:text-blue-500 transition-colors">{ticket.subject}</h3>
                  <p className="text-sm text-muted-foreground">Loja: <span className="font-medium text-foreground">{ticket.store}</span> • {ticket.date}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-end sm:justify-start">
                <button className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-border-subtle">
                  Responder
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
