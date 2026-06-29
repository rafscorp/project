"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

export function FilaClient({ initialQueues, storeId }: { initialQueues: any[], storeId: string }) {
  const router = useRouter();
  const [queues, setQueues] = useState(initialQueues);
  const [code, setCode] = useState("");
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
      setCode("");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    
    // Find the queue by code
    const queueItem = queues.find(q => q.code === cleanCode);
    if (queueItem) {
      handleFinalizeCode(queueItem.id, cleanCode);
    } else {
      setError("Código não encontrado na sua fila de pendentes.");
    }
  };

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="p-6 bg-zinc-900/50">
          <form onSubmit={handleManualCodeSubmit} className="flex gap-4 items-end">
            <div className="flex-1 max-w-sm">
              <label className="text-xs font-bold text-foreground/80 mb-2 block uppercase tracking-wider">
                Código de Compra (5 caracteres)
              </label>
              <input
                type="text"
                placeholder="Ex: 1234X"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                maxLength={5}
                required
                className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-emerald-500/50 outline-none uppercase font-mono tracking-widest"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || code.length < 5} 
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-[50px] px-8 rounded-xl"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Validar e Finalizar Venda"}
            </Button>
          </form>

          {error && <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {error}</div>}
          {success && <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> {success}</div>}
        </CardBody>
      </Card>

      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-foreground">Clientes Aguardando ({queues.length})</h2>
        
        {queues.length === 0 && (
          <div className="p-8 text-center border border-border-subtle rounded-2xl bg-panel/30">
            <p className="text-muted-foreground">Nenhum cliente na fila no momento.</p>
          </div>
        )}

        <div className="grid gap-4">
          {queues.map((q) => {
            const isLate = new Date(q.createdAt) < twoHoursAgo;
            
            return (
              <Card key={q.id} className={isLate ? "border-red-500/30 bg-red-500/5" : ""}>
                <CardBody className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-foreground">{q.customer.name}</h3>
                      <span className="text-xs text-muted-foreground">{q.customer.phone || "Sem telefone"}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Peça Solicitada:</strong> {q.partDescription}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className={`h-3 w-3 ${isLate ? "text-red-400" : "text-muted-foreground"}`} />
                      <span className={`text-xs ${isLate ? "text-red-400 font-bold" : "text-muted-foreground"}`}>
                        Gerado em {formatDate(q.createdAt)} {isLate && "(+2 horas)"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="bg-zinc-800 border border-border-subtle rounded-lg px-4 py-2 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Código</p>
                      <p className="font-mono text-lg font-black tracking-widest text-emerald-400">{q.code}</p>
                    </div>
                    
                    <Button 
                      onClick={() => handleFinalizeCode(q.id, q.code)}
                      disabled={loading}
                      variant="outline"
                      className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                    >
                      Finalizar
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
