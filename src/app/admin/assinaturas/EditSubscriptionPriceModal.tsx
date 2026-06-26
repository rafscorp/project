"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils/format";
import { X, Save, Edit2 } from "lucide-react";

interface Subscription {
  id: string;
  store: { name: string };
  plan: { name: string; priceMonthly: number };
  customPrice: number | null;
  discountPercentage: number | null;
  discountReason: string | null;
}

interface EditSubscriptionPriceModalProps {
  subscription: Subscription;
}

export function EditSubscriptionPriceModal({ subscription }: EditSubscriptionPriceModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<"percentage" | "fixed">(subscription.customPrice ? "fixed" : "percentage");
  const [discountPercentage, setDiscountPercentage] = useState(subscription.discountPercentage?.toString() || "");
  const [customPrice, setCustomPrice] = useState(subscription.customPrice?.toString() || "");
  const [discountReason, setDiscountReason] = useState(subscription.discountReason || "");

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: any = { discountReason };
      
      if (mode === "percentage") {
        payload.discountPercentage = discountPercentage ? parseFloat(discountPercentage) : null;
        payload.customPrice = null;
      } else {
        payload.customPrice = customPrice ? parseFloat(customPrice.replace(",", ".")) : null;
        payload.discountPercentage = null;
      }

      const res = await fetch(`/api/admin/subscriptions/${subscription.id}/discount`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Edit2 className="h-4 w-4 mr-2" /> Editar Preço
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl bg-panel p-6 shadow-2xl relative border border-border">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-bold text-foreground mb-4">Ajustar Preço e Descontos</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Assinatura: <strong>{subscription.store.name}</strong> ({subscription.plan.name})<br/>
              Preço Original: <strong>{formatCurrency(subscription.plan.priceMonthly)}</strong>
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm border border-red-500/20">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-background rounded-lg border border-border">
                <button 
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === "percentage" ? "bg-panel shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setMode("percentage")}
                >
                  % Desconto
                </button>
                <button 
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === "fixed" ? "bg-panel shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setMode("fixed")}
                >
                  Preço Fixo
                </button>
              </div>

              {mode === "percentage" ? (
                <Input 
                  label="Desconto (%)" 
                  type="number" 
                  placeholder="Ex: 15"
                  value={discountPercentage} 
                  onChange={(e) => setDiscountPercentage(e.target.value)} 
                />
              ) : (
                <Input 
                  label="Preço Fixo (R$)" 
                  type="number" 
                  placeholder="Ex: 199.90"
                  step="0.01"
                  value={customPrice} 
                  onChange={(e) => setCustomPrice(e.target.value)} 
                />
              )}

              <Input 
                label="Motivo / Justificativa" 
                placeholder="Ex: Negociação comercial"
                value={discountReason} 
                onChange={(e) => setDiscountReason(e.target.value)} 
              />
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} loading={loading} className="bg-violet-600 hover:bg-violet-500 text-white">
                <Save className="h-4 w-4 mr-2" /> Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
