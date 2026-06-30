
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { CheckCircle2, Clock, AlertTriangle, Loader2, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

export function FilaClient({ initialQueues, storeId }: { initialQueues: any[], storeId: string }) {
  const router = useRouter();
  const [queues, setQueues] = useState(initialQueues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFinalizeCode = async (id: string, queueCode: string) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/queue/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, code: queueCode })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao finalizar cliente.");

      setSuccess(`Venda finalizada com sucesso! (Código: ${queueCode})`);
      setQueues(q => q.filter(item => item.id !== id));
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {error}</div>}
      {success && <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> {success}</div>}

      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-foreground">Clientes Aguardando ({queues.length})</h2>
        
        {queues.length === 0 && (
          <div className="p-8 text-center border border-border-subtle rounded-2xl bg-panel/30">
            <p className="text-muted-foreground">Nenhum cliente na fila no momento.</p>
          </div>
        )}

        <div className="grid gap-6">
          {queues.map((q) => (
            <FilaItemCard 
              key={q.id} 
              q={q} 
              onFinalize={handleFinalizeCode} 
              loading={loading} 
              isLate={new Date(q.createdAt) < twoHoursAgo} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilaItemCard({ 
  q, 
  onFinalize, 
  loading, 
  isLate 
}: { 
  q: any; 
  onFinalize: (id: string, code: string) => Promise<void>; 
  loading: boolean; 
  isLate: boolean;
}) {
  const [localCode, setLocalCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localCode.trim().length === 5) {
      onFinalize(q.id, localCode.trim().toUpperCase());
    }
  };

  return (
    <Card className={isLate ? "border-red-500/30 bg-red-500/5" : "border-border-subtle bg-panel/20"}>
      <CardBody className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-subtle/50 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg text-foreground">{q.customer.name}</h3>
              <span className="text-xs text-zinc-500 font-mono">@{q.customer.username}</span>
              <span className="text-xs text-muted-foreground">{q.customer.phone || "Sem telefone"}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Peça Reservada:</strong> <span className="text-white font-medium">{q.partDescription}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${isLate ? "text-red-400" : "text-muted-foreground"}`} />
            <span className={`text-xs ${isLate ? "text-red-400 font-bold" : "text-muted-foreground"}`}>
              Fila iniciada em {formatDate(q.createdAt)} {isLate && "(+2 horas)"}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-6">
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 flex-1 max-w-lg">
            <div className="flex-1 min-w-[150px]">
              <label className="text-[10px] font-bold text-foreground/75 mb-1.5 block uppercase tracking-wider">
                Inserir Código do Cliente
              </label>
              <input
                type="text"
                placeholder="EX: 123X5"
                value={localCode}
                onChange={e => setLocalCode(e.target.value.toUpperCase())}
                maxLength={5}
                required
                className="w-full bg-zinc-950 border border-border-subtle rounded-xl px-4 py-2 text-foreground focus:ring-2 focus:ring-emerald-500/50 outline-none uppercase font-mono tracking-widest text-sm"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={loading || localCode.trim().length < 5} 
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 px-6 rounded-xl text-sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validar e Efetivar"}
            </Button>
          </form>

          <Link
            href={`/loja/painel/chat?customerId=${q.customer.id}`}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-zinc-800 transition-colors shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5 text-violet-400" /> Falar no Chat
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
